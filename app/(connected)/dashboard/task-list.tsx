"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api-client";
import { taskResponseSchema } from "../../../lib/validation";

type Task = { id: string; title: string; minutes: number; done: boolean };

export function TaskList({ tasks }: { tasks: Task[] }) {
  const queryClient = useQueryClient();
  const queryKey = ["dashboard", "tasks"] as const;
  const { data: items = tasks } = useQuery({ queryKey, queryFn: () => Promise.resolve(tasks), initialData: tasks, staleTime: Infinity });
  const toggle = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/tasks/${id}`, { method: "PATCH" }, taskResponseSchema),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey) ?? tasks;
      queryClient.setQueryData<Task[]>(queryKey, current => (current ?? tasks).map(task => task.id === id ? { ...task, done: !task.done } : task));
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(queryKey, context?.previous),
    onSuccess: result => queryClient.setQueryData<Task[]>(queryKey, current => (current ?? tasks).map(task => task.id === result.id ? { ...task, done: result.done } : task)),
  });
  return <div>{items.map(item=><button className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-accent-subtle" disabled={toggle.isPending && toggle.variables === item.id} onClick={()=>toggle.mutate(item.id)} key={item.id}><span className={`flex size-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${item.done?"border-positive bg-positive text-white":"border-ui-border"}`}>{item.done?"✓":""}</span><span className={`flex-1 text-sm ${item.done?"text-subtle line-through":""}`}>{item.title}</span><span className="font-mono text-label text-subtle">{item.minutes} min</span></button>)}</div>;
}
