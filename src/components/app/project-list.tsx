"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { ChevronRight, Trash2 } from "lucide-react";

import { deleteProjectAction } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "@/components/app/project-avatar";

type ProjectListItem = {
  id: string;
  name: string;
  agentCount: number;
  // Stored in micro-units to stay aligned with backend values
  monthlySpent: number;
  avatar?: string | null;
};

type ProjectListProps = {
  projects: ProjectListItem[];
};

export function ProjectList({ projects }: ProjectListProps) {
  const [items, setItems] = useState(projects);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const startXRef = useRef<number | null>(null);
  const swipeHandledRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const [isPending, startTransition] = useTransition();

  const formatCurrency = (microAmount: number) => {
    const dollars = microAmount / 1_000_000;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(dollars);
  };

  const handlePointerDown = (id: string) => (event: React.PointerEvent) => {
    startXRef.current = event.clientX;
    swipeHandledRef.current = false;
    pointerActiveRef.current = true;
  };

  const handlePointerMove = (id: string) => (event: React.PointerEvent) => {
    if (!pointerActiveRef.current || startXRef.current === null) return;
    const deltaX = event.clientX - startXRef.current;

    if (deltaX > 30) {
      setSwipedId(id);
      swipeHandledRef.current = true;
    } else if (deltaX < -30 && swipedId === id) {
      setSwipedId(null);
      swipeHandledRef.current = true;
    }
  };

  const handlePointerUp = (id: string) => (event: React.PointerEvent) => {
    if (startXRef.current !== null) {
      const deltaX = event.clientX - startXRef.current;

      if (deltaX > 30) {
        setSwipedId(id);
        swipeHandledRef.current = true;
      } else if (deltaX < -30 && swipedId === id) {
        setSwipedId(null);
        swipeHandledRef.current = true;
      }
    }

    startXRef.current = null;
    pointerActiveRef.current = false;
  };

  const handleWheel = (id: string) => (event: React.WheelEvent) => {
    // Trackpad two-finger swipe sends wheel events; react to horizontal intent only
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

    if (event.deltaX > 20) {
      setSwipedId(id);
      swipeHandledRef.current = true;
    } else if (event.deltaX < -20 && swipedId === id) {
      setSwipedId(null);
      swipeHandledRef.current = true;
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (swipeHandledRef.current) {
      event.preventDefault();
      event.stopPropagation();
      swipeHandledRef.current = false;
      return;
    }

    if (swipedId) {
      setSwipedId(null);
    }
  };

  const openConfirm = (projectId: string) => {
    setConfirmId(projectId);
    setActionError(null);
  };

  const handleDelete = () => {
    if (!confirmId) return;

    startTransition(async () => {
      setActionError(null);
      const result = await deleteProjectAction(confirmId);

      if (result?.error) {
        setActionError(result.error);
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== confirmId));
      setSwipedId(null);
      setConfirmId(null);
    });
  };

  return (
    <>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-neutral-500">
            No projects yet. Create one to get started!
          </p>
        ) : (
          items.map((project) => (
            <div
              key={project.id}
              className="relative overflow-hidden rounded-lg border border-neutral-100 bg-white"
            >
              <div className="absolute right-0 top-0 bottom-0 flex items-center bg-red-50 pr-3 pl-2">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-transparent focus-visible:bg-transparent active:bg-transparent transition-transform hover:scale-110"
                  aria-label="Delete project"
                  onClick={(event) => {
                    event.stopPropagation();
                    openConfirm(project.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.75} />
                </Button>
              </div>

              <Link
                href={`/app/projects/${project.id}`}
                className={cn(
                  "relative z-10 flex items-center justify-between rounded-lg bg-white p-3 transition-transform duration-200 ease-out hover:bg-neutral-50",
                  swipedId === project.id ? "-translate-x-24" : "translate-x-0"
                )}
                onPointerDown={handlePointerDown(project.id)}
                onPointerMove={handlePointerMove(project.id)}
                onPointerUp={handlePointerUp(project.id)}
                onPointerCancel={() => {
                  startXRef.current = null;
                  swipeHandledRef.current = false;
                  pointerActiveRef.current = false;
                }}
                onWheel={handleWheel(project.id)}
                onClick={handleClick}
              >
                <div className="flex items-center gap-3">
                  <ProjectAvatar projectId={project.id} avatarKey={project.avatar ?? undefined} size={32} />
                  <div>
                    <p className="text-[13px] font-medium text-neutral-900">
                      {project.name}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {project.agentCount} agents
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[13px] font-medium text-neutral-700">
                    {formatCurrency(project.monthlySpent)}
                  </p>
                  <ChevronRight className="h-4 w-4 text-neutral-300" strokeWidth={1.5} />
                </div>
              </Link>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are u sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the project and its agents. You cannot undo this action.
            </AlertDialogDescription>
            {actionError && (
              <p className="text-[12px] font-medium text-destructive">
                {actionError}
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

