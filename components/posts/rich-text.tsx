import Image from "next/image";
import {
  type JSXConvertersFunction,
  RichText as ConvertRichText,
} from "@payloadcms/richtext-lexical/react";
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
} from "@payloadcms/richtext-lexical";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import type { Media, MediaBlock as MediaBlockProps } from "@/payload-types";
import styles from "./rich-text.module.css";

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<MediaBlockProps>;

// Cualquier campo richText que use este mismo set de features (posts,
// avisos, y lo que venga después) comparte esta forma — por eso el tipo
// no está atado a `Post["content"]` ni a ninguna colección puntual.
export type RichTextContent = SerializedEditorState<NodeTypes>;

function getMediaUrl(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    // Ya es una URL relativa.
    return url;
  }
}

function isPopulatedMedia(value: unknown): value is Media {
  return typeof value === "object" && value !== null && "url" in value;
}

const converters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  // Imágenes sueltas insertadas con el feature de upload por defecto de Lexical.
  upload: ({ node }) => {
    const media = node.value;
    if (!isPopulatedMedia(media) || !media.url) return null;

    const imageUrl = getMediaUrl(media.url);

    return (
      <AspectRatio
        ratio={16 / 9}
        className="my-10 overflow-hidden rounded-lg bg-muted"
      >
        <Image
          src={imageUrl}
          alt={media.alt ?? ""}
          fill
          className="object-cover"
        />
      </AspectRatio>
    );
  },
  // Nuestro MediaBlock (BlocksFeature) definido en payload/blocks/MediaBlock.ts
  blocks: {
    mediaBlock: ({ node }) => {
      const media = node.fields.media;
      if (!isPopulatedMedia(media) || !media.url) return null;

      const imageUrl = getMediaUrl(media.url);

      return (
        <AspectRatio
          ratio={16 / 9}
          className="my-10 overflow-hidden rounded-lg bg-muted"
        >
          <Image
            src={imageUrl}
            alt={media.alt ?? ""}
            fill
            className="object-cover"
          />
        </AspectRatio>
      );
    },
  },
});

export function RichText({ content }: { content: RichTextContent }) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-24",
        "prose-h1:mt-2 prose-h1:text-[1.9rem]",
        "prose-h2:mt-14 prose-h2:text-[1.55rem] prose-h2:leading-snug",
        "prose-h3:mt-10 prose-h3:text-[1.2rem]",
        "prose-h4:mt-8 prose-h4:text-[1.05rem] prose-h4:font-medium prose-h4:text-foreground/90",
        "prose-p:text-[1.0625rem] prose-p:leading-[1.8] prose-p:text-foreground/90",
        "prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:decoration-primary/40 prose-a:decoration-2 prose-a:underline-offset-[3px] prose-a:transition-colors hover:prose-a:decoration-primary",
        "prose-strong:font-semibold prose-strong:text-foreground",
        "prose-blockquote:my-8 prose-blockquote:not-italic prose-blockquote:[quotes:none] prose-blockquote:rounded-r-md prose-blockquote:border-l-2 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/40 prose-blockquote:py-1 prose-blockquote:pl-6 prose-blockquote:pr-5 prose-blockquote:text-[1.05em] prose-blockquote:font-normal prose-blockquote:leading-relaxed prose-blockquote:text-foreground/90",
        "prose-ol:my-6 prose-ol:space-y-2 prose-ul:my-6 prose-ul:space-y-2 [&_li]:marker:text-muted-foreground/70",
        "prose-hr:my-16 prose-hr:h-px prose-hr:w-16 prose-hr:mx-auto prose-hr:border-none prose-hr:bg-border",
        "prose-img:rounded-lg",
        styles.richText,
      )}
    >
      <ConvertRichText converters={converters} data={content} />
    </div>
  );
}