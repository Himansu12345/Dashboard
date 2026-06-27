"use client";

import { m, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { useHydrationSafeReducedMotion } from "@/components/motion/useHydrationSafeReducedMotion";
import {
  chartEntryVariants,
  listItemVariants,
  listStaggerVariants,
  modalBackdropVariants,
  modalPanelVariants,
  pageFadeVariants,
  sectionRevealVariants,
  MOTION_SPRING_GENTLE,
  MOTION_SPRING_SOFT,
} from "@/components/motion/variants";

interface MotionPageProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

interface MotionSectionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delayIndex?: number;
}

interface MotionCardProps extends HTMLMotionProps<"article"> {
  children: ReactNode;
  disableReveal?: boolean;
}

interface MotionListProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

interface MotionListItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

interface MotionButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
}

export function MotionPage({ children, ...props }: MotionPageProps) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <m.div
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      variants={pageFadeVariants}
      {...props}
    >
      {children}
    </m.div>
  );
}

export function MotionSection({
  children,
  delayIndex = 0,
  viewport = { once: true, amount: 0.16 },
  ...props
}: MotionSectionProps) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <m.div
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={reduceMotion ? undefined : viewport}
      variants={sectionRevealVariants}
      custom={delayIndex}
      {...props}
    >
      {children}
    </m.div>
  );
}

export function MotionCard({
  children,
  initial,
  whileInView,
  viewport,
  variants,
  whileHover,
  whileTap,
  disableReveal = false,
  ...props
}: MotionCardProps) {
  const reduceMotion = useHydrationSafeReducedMotion();
  const resolvedInitial = disableReveal ? false : (initial ?? "hidden");
  const resolvedWhileInView = disableReveal ? undefined : (whileInView ?? "visible");
  const resolvedViewport = disableReveal ? undefined : (viewport ?? { once: true, amount: 0.2 });
  const resolvedVariants = disableReveal ? undefined : (variants ?? chartEntryVariants);

  return (
    <m.article
      initial={reduceMotion ? false : resolvedInitial}
      whileInView={reduceMotion ? undefined : resolvedWhileInView}
      viewport={reduceMotion ? undefined : resolvedViewport}
      variants={resolvedVariants}
      whileHover={
        reduceMotion
          ? undefined
          : whileHover || {
              y: -3,
              scale: 1.01,
              transition: MOTION_SPRING_SOFT,
            }
      }
      whileTap={
        reduceMotion
          ? undefined
          : whileTap || { y: 0, scale: 0.99, transition: MOTION_SPRING_GENTLE }
      }
      {...props}
    >
      {children}
    </m.article>
  );
}

export function MotionList({
  children,
  initial = "hidden",
  whileInView = "visible",
  viewport = { once: true, amount: 0.16 },
  variants = listStaggerVariants,
  ...props
}: MotionListProps) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <m.div
      initial={reduceMotion ? false : initial}
      whileInView={reduceMotion ? undefined : whileInView}
      viewport={reduceMotion ? undefined : viewport}
      variants={variants}
      {...props}
    >
      {children}
    </m.div>
  );
}

export function MotionListItem({
  children,
  variants = listItemVariants,
  ...props
}: MotionListItemProps) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <m.div variants={reduceMotion ? undefined : variants} {...props}>
      {children}
    </m.div>
  );
}

export function MotionTableBody(props: HTMLMotionProps<"tbody">) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <m.tbody
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      variants={listStaggerVariants}
      {...props}
    />
  );
}

export function MotionTableRow(props: HTMLMotionProps<"tr">) {
  const reduceMotion = useHydrationSafeReducedMotion();
  return <m.tr variants={reduceMotion ? undefined : listItemVariants} {...props} />;
}

export function MotionModalBackdrop(props: HTMLMotionProps<"div">) {
  const reduceMotion = useHydrationSafeReducedMotion();
  return (
    <m.div
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      variants={modalBackdropVariants}
      {...props}
    />
  );
}

export function MotionModalPanel(props: HTMLMotionProps<"section">) {
  const reduceMotion = useHydrationSafeReducedMotion();
  return (
    <m.section
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      variants={modalPanelVariants}
      {...props}
    />
  );
}

export function MotionButton({ children, whileHover, whileTap, ...props }: MotionButtonProps) {
  const reduceMotion = useHydrationSafeReducedMotion();
  return (
    <m.button
      whileHover={reduceMotion ? undefined : whileHover || { y: -2, scale: 1.02, transition: MOTION_SPRING_SOFT }}
      whileTap={reduceMotion ? undefined : whileTap || { y: 0, scale: 0.97, transition: MOTION_SPRING_GENTLE }}
      {...props}
    >
      {children}
    </m.button>
  );
}
