"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAttempts, mapAttemptToPracticeRecord } from "@/lib/api/attempts";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setRecords } from "@/store/slices/recordsSlice";
import { areRecordsEquivalent } from "@/app/appClientUtils";

const ATTEMPTS_QUERY_KEY = ["attempts"] as const;

export default function RecordsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const records = useAppSelector((state) => state.records.records);

  const attemptsQuery = useQuery({
    queryKey: ATTEMPTS_QUERY_KEY,
    queryFn: fetchAttempts,
    staleTime: 30000,
  });

  const mappedRecords = useMemo(
    () =>
      (attemptsQuery.data ?? []).map((attempt) =>
        mapAttemptToPracticeRecord(attempt),
      ),
    [attemptsQuery.data],
  );

  useEffect(() => {
    if (areRecordsEquivalent(records, mappedRecords)) return;
    dispatch(setRecords(mappedRecords));
  }, [dispatch, mappedRecords, records]);

  return <>{children}</>;
}
