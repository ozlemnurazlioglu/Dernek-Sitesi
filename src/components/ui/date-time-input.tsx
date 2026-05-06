"use client";

/**
 * `<input type="datetime-local">` ve `<input type="date">` için kararlı sarmalayıcılar.
 *
 * Sorun: native input'u **her keystroke'ta** parent state'e
 * `new Date(value).toISOString()` ile yazıp tekrar `value=` ile
 * controlled hâle getirirsek, kullanıcı yıl alanına `2`, `0`, `2`, `6`
 * tuşladığında her tuş sonrası React `value`'yu yeniden set eder; bu da
 * tarayıcının yıl parça-cursor'unu sıfırlar veya başka pozisyona atlatır.
 * Sonuçta `2026` yerine `0022` gibi karışık değerler oluşur. Müşteri
 * "klavyeden yıl yazılmıyor, sadece takvimden seçilebiliyor" diyordu.
 *
 * Çözüm: input'un `value`'sunu **yerel** bir string state'ten oku.
 * `onChange`'de yalnızca yerel state güncellenir. Parent ISO state'i,
 * geçerli ve makul (1900–2100) bir tarih oluştuğunda commit edilir;
 * kullanıcı alandan çıktığında ek bir commit + revert güvencesi var.
 *
 * Parent prop'u dışarıdan değişirse (modal başka bir kayıt açtı vs.)
 * `useEffect` bunu yakalayıp local'i sync ediyor; ancak commit'i biz
 * yaptığımızda gereksiz override olmasın diye `lastSyncedIso` ref'i ile
 * koruyoruz.
 */

import {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { Input } from "@/components/ui/input";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

function isReasonableDate(d: Date): boolean {
  if (Number.isNaN(d.getTime())) return false;
  const year = d.getFullYear();
  return year >= MIN_YEAR && year <= MAX_YEAR;
}

function isoToLocalDateTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

function isoToLocalDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

type DateTimeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  valueIso: string;
  onChangeIso: (iso: string) => void;
  invalid?: boolean;
};

export function DateTimeInput({
  valueIso,
  onChangeIso,
  invalid,
  onBlur,
  ...rest
}: DateTimeInputProps) {
  const [local, setLocal] = useState<string>(() => isoToLocalDateTime(valueIso));
  const lastSyncedIso = useRef<string>(valueIso);

  useEffect(() => {
    if (valueIso !== lastSyncedIso.current) {
      setLocal(isoToLocalDateTime(valueIso));
      lastSyncedIso.current = valueIso;
    }
  }, [valueIso]);

  const tryCommit = (str: string) => {
    if (!str) return;
    const d = new Date(str);
    if (!isReasonableDate(d)) return;
    const iso = d.toISOString();
    if (iso !== lastSyncedIso.current) {
      lastSyncedIso.current = iso;
      onChangeIso(iso);
    }
  };

  return (
    <Input
      type="datetime-local"
      invalid={invalid}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        tryCommit(e.target.value);
      }}
      onBlur={(e) => {
        const d = new Date(local);
        if (isReasonableDate(d)) {
          tryCommit(local);
        } else {
          setLocal(isoToLocalDateTime(valueIso));
        }
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}

type DateInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  /**
   * Hem `YYYY-MM-DD` (input formatı) hem ISO 8601 kabul edilir.
   * Çıkış formatı `outputFormat` ile seçilir; varsayılan `iso`.
   */
  valueIso: string;
  onChangeIso: (value: string) => void;
  outputFormat?: "iso" | "date";
  invalid?: boolean;
};

export function DateInput({
  valueIso,
  onChangeIso,
  outputFormat = "iso",
  invalid,
  onBlur,
  ...rest
}: DateInputProps) {
  const [local, setLocal] = useState<string>(() => isoToLocalDate(valueIso));
  const lastSyncedIso = useRef<string>(valueIso);

  useEffect(() => {
    if (valueIso !== lastSyncedIso.current) {
      setLocal(isoToLocalDate(valueIso));
      lastSyncedIso.current = valueIso;
    }
  }, [valueIso]);

  const tryCommit = (str: string) => {
    if (!str) return;
    // input "YYYY-MM-DD" veriyor; saat dilimi farklarından dolayı UTC'ye
    // sabitlemek için açıkça T00:00:00 ekliyoruz.
    const d = new Date(`${str}T00:00:00`);
    if (!isReasonableDate(d)) return;
    const out = outputFormat === "date" ? str : d.toISOString();
    if (out !== lastSyncedIso.current) {
      lastSyncedIso.current = out;
      onChangeIso(out);
    }
  };

  return (
    <Input
      type="date"
      invalid={invalid}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        tryCommit(e.target.value);
      }}
      onBlur={(e) => {
        const d = new Date(`${local}T00:00:00`);
        if (isReasonableDate(d)) {
          tryCommit(local);
        } else {
          setLocal(isoToLocalDate(valueIso));
        }
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}
