import { getPayload } from "payload";
import config from "@/payload.config";
import type { Notice } from "@/payload-types";

const MEXICO_TIME_ZONE = "America/Mexico_City";

type ActiveImportantNotice = Notice & {
  isImportant: true;
  expirationDate: string;
};

function getTodayMexico(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getNoticeExpirationDateOnly(expirationDate: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(expirationDate));
}

/**
 * Determina si un aviso está vigente según el día calendario
 * de America/Mexico_City.
 *
 * Un aviso que expira hoy sigue vigente durante todo el día.
 */
export function isNoticeActive(
  notice: Pick<Notice, "isImportant" | "expirationDate">,
): boolean {
  if (!notice.isImportant || !notice.expirationDate) {
    return false;
  }

  const today = getTodayMexico();
  const expirationDate = getNoticeExpirationDateOnly(
    notice.expirationDate,
  );

  return expirationDate >= today;
}

export async function queryNoticeBySlug(
  slug: string,
): Promise<Notice | null> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "notices",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  });

  return result.docs[0] ?? null;
}

/**
 * Avisos importantes y vigentes para la landing.
 *
 * Aquí NO usamos directamente una comparación de Payload con new Date()
 * porque expirationDate representa una fecha civil en México.
 */
export async function queryActiveImportantNotices(): Promise<Notice[]> {
  const payload = await getPayload({
    config,
  });

  const result = await payload.find({
    collection: "notices",

    where: {
      and: [
        {
          _status: {
            equals: "published",
          },
        },
        {
          isImportant: {
            equals: true,
          },
        },
      ],
    },

    sort: "-publishedAt",

    limit: 100,

    depth: 2,
  });

  return result.docs.filter(isNoticeActive);
}

type NoticeNavigationResult = {
  previous: Pick<Notice, "title" | "slug"> | null;
  next: Pick<Notice, "title" | "slug"> | null;
};

export async function queryNoticesForNavigation({
  currentSlug,
}: {
  currentSlug: string;
}): Promise<NoticeNavigationResult> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "notices",
    where: {},
    sort: "-publishedAt",
    limit: 100,
    depth: 0,
  });

  const docs = result.docs;

  const currentIndex = docs.findIndex(
    (notice) => notice.slug === currentSlug,
  );

  if (currentIndex === -1) {
    return {
      previous: null,
      next: null,
    };
  }

  const previous =
    currentIndex > 0
      ? docs[currentIndex - 1]
      : null;

  const next =
    currentIndex < docs.length - 1
      ? docs[currentIndex + 1]
      : null;

  return {
    previous: previous
      ? {
          title: previous.title,
          slug: previous.slug,
        }
      : null,
    next: next
      ? {
          title: next.title,
          slug: next.slug,
        }
      : null,
  };
}