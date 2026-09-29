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
import type { Media, MediaBlock as MediaBlockProps } from "@/payload-types";
import styles from "./rich-text.module.css";

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<MediaBlockProps>;

export type RichTextContent = SerializedEditorState<NodeTypes>;

function getMediaUrl(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function isPopulatedMedia(value: unknown): value is Media {
  return typeof value === "object" && value !== null && "url" in value;
}

function MediaContent({ media }: { media: Media }) {
  if (!media.url) {
    return null;
  }

  const imageUrl = getMediaUrl(media.url);

  const width =
    typeof media.width === "number" && media.width > 0 ? media.width : 1600;

  const height =
    typeof media.height === "number" && media.height > 0 ? media.height : 900;

  return (
    <figure className={styles.mediaFigure}>
      <div className={styles.mediaFrame}>
        <Image
          src={imageUrl}
          alt={media.alt ?? ""}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 768px, 100vw"
          className={styles.mediaImage}
        />
      </div>
    </figure>
  );
}

const converters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,

  upload: ({ node }) => {
    const media = node.value;

    if (!isPopulatedMedia(media) || !media.url) {
      return null;
    }

    return <MediaContent media={media} />;
  },

  blocks: {
    mediaBlock: ({ node }) => {
      const media = node.fields.media;

      if (!isPopulatedMedia(media) || !media.url) {
        return null;
      }

      return <MediaContent media={media} />;
    },
  },
});

export function RichText({ content }: { content: RichTextContent }) {
  return (
    <div
      className={`${styles.richText} prose prose-neutral max-w-none dark:prose-invert`}
    >
      <ConvertRichText converters={converters} data={content} />
    </div>
  );
}
