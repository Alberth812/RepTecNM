import Image from "next/image";
import {
  type JSXConvertersFunction,
  RichText as ConvertRichText,
} from "@payloadcms/richtext-lexical/react";
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedUploadNode,
} from "@payloadcms/richtext-lexical";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type {
  Media,
  MediaBlock as MediaBlockProps,
  Post,
} from "@/payload-types";

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<MediaBlockProps>;

function getMediaUrl(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    // Already a relative URL.
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
  // Imágenes sueltas insertadas con el feature de upload por defecto de Lexical
  upload: ({ node }: { node: SerializedUploadNode }) => {
    const media = node.value;
    if (!isPopulatedMedia(media) || !media.url) return null;

    const imageUrl = getMediaUrl(media.url);

    return (
      <AspectRatio
        ratio={16 / 9}
        className="my-8 overflow-hidden rounded-lg bg-muted"
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
          className="my-8 overflow-hidden rounded-lg bg-muted"
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

export function PostRichText({ content }: { content: Post["content"] }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-medium">
      <ConvertRichText converters={converters} data={content} />
    </div>
  );
}
