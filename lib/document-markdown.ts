import {formatFromExtension,toMarkdownBytes} from "@firecrawl/anydoc";

export const ANYDOC_EXTENSIONS=["pdf","doc","docx","docm","ppt","pps","pot","pptx","pptm","ppsx","ppsm","xls","xlsx","xlsm","xlsb","odt","ods","odp","rtf","epub","csv"] as const;
export const ANYDOC_ACCEPT=ANYDOC_EXTENSIONS.map(extension=>`.${extension}`).join(",");

type AnyDocError=Error&{code?:string};
function friendlyError(error:unknown){const problem=error as AnyDocError;if(problem?.code==="encrypted")return "This document is password-protected. Upload an unlocked copy.";if(problem?.code==="unsupported")return "This document format or image-only PDF cannot be read.";if(problem?.code==="resourceLimit")return "This document is too complex to process safely.";if(problem?.code==="malformed"||problem?.code==="missingPart")return "This document appears damaged or incomplete.";return problem instanceof Error?problem.message:"Unable to convert this document."}

export async function documentToMarkdown(file:File,{maxBytes=10_000_000,maxCharacters=120_000}:{maxBytes?:number;maxCharacters?:number}={}){
 if(file.size===0)throw new Error("Choose a non-empty document.");
 if(file.size>maxBytes)throw new Error(`Document is too large. Upload a file under ${Math.floor(maxBytes/1_000_000)} MB.`);
 const extension=file.name.split(".").pop()?.toLowerCase()??"";
 if(!ANYDOC_EXTENSIONS.includes(extension as (typeof ANYDOC_EXTENSIONS)[number]))throw new Error("Unsupported document. Upload PDF, Word, OpenDocument, RTF, EPUB, PowerPoint, Excel, or CSV.");
 try{
  const bytes=new Uint8Array(await file.arrayBuffer());
  const markdown=(await toMarkdownBytes(bytes,formatFromExtension(extension))).trim();
  if(!markdown)throw new Error("No readable content was found in this document.");
  return markdown.slice(0,maxCharacters);
 }catch(error){throw new Error(friendlyError(error),{cause:error})}
}
