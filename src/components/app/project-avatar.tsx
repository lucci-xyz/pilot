"use client";

import React from "react";
import ProjectAvatarDefault, {
  ProjectAvatarOrangeSVG,
  ProjectAvatarPurpleAlt2SVG,
  ProjectAvatarPurpleAlt3SVG,
  ProjectAvatarPurpleAltSVG,
  ProjectAvatarPurpleSVG,
} from "../../../public/project-avatars";
import {
  PROJECT_AVATAR_KEYS,
  ProjectAvatarKey,
  deterministicAvatarKey,
  isValidAvatarKey,
} from "@/lib/project-avatars";

type AvatarComponent = React.ComponentType<{ id?: string; width?: number; height?: number; className?: string }>;

const AVATAR_VARIANTS: Record<ProjectAvatarKey, AvatarComponent> = {
  default: ProjectAvatarDefault,
  purple: ProjectAvatarPurpleSVG,
  purple_alt: ProjectAvatarPurpleAltSVG,
  purple_alt2: ProjectAvatarPurpleAlt2SVG,
  purple_alt3: ProjectAvatarPurpleAlt3SVG,
  orange: ProjectAvatarOrangeSVG,
};

export function ProjectAvatar({
  projectId,
  avatarKey,
  size = 32,
  className,
}: {
  projectId: string;
  avatarKey?: string | null;
  size?: number;
  className?: string;
}) {
  const key =
    (avatarKey && isValidAvatarKey(avatarKey)
      ? (avatarKey as ProjectAvatarKey)
      : deterministicAvatarKey(projectId));

  const AvatarComp = AVATAR_VARIANTS[key];

  return (
    <AvatarComp
      id={`${projectId}-avatar`}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  );
}

