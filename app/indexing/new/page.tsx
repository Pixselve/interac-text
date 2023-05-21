"use client";
import { plainTextFileToEmbeddings } from "@/lib/pinecone";
import { log } from "console";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type Inputs = {
  file: FileList;
  sourceDisplayName: string;
  chunkSize: number;
};

export default function () {
  /**
   * Evaluate the number of embeddings in the document
   * @returns {number} The number of embeddings in the document
   */
  function evaluateEmbeddingCount(file: FileList) {
    if (file === undefined || file.length === 0) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const contents = reader.result as string;
      const numChunks = Math.ceil(
        contents.length / getValues("chunkSize") ?? 500
      );
      setEmbeddingCount(numChunks);
    };
    reader.readAsText(file[0]);

    const fileName = file[0].name;
    const extensionIndex = fileName.lastIndexOf(".");
    const nameWithoutExtension =
      extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
    if (
      getValues("sourceDisplayName") === "" ||
      getValues("sourceDisplayName") === null
    ) {
      setValue("sourceDisplayName", nameWithoutExtension, {
        shouldValidate: true,
      });
    }
  }

  const [embeddingCount, setEmbeddingCount] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<Inputs>({
    defaultValues: {
      chunkSize: 500,
    },
  });

  const router = useRouter();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      if (!file) {
        console.error("No file selected");
        return;
      }

      const formData = new FormData();
      formData.append("file", data.file[0]);

      await plainTextFileToEmbeddings(
        formData,
        data.sourceDisplayName,
        data.chunkSize
      );
      // refresh the page
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const file = watch("file");
  const chunkSize = watch("chunkSize");

  useEffect(() => {
    evaluateEmbeddingCount(file);
  }, [file, chunkSize]);

  const [loading, setLoading] = useState(false);

  return (
    <>
      <h1 className="font-bold text-2xl">Add a document</h1>
      <p className="text-gray-500">Add a document to the index</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("file", { required: true })}
          type="file"
          className="file-input w-full"
          accept="text/plain"
        />

        <input
          {...register("sourceDisplayName", { required: true })}
          type="text"
          className="input w-full"
          placeholder="Source display name"
        />

        <input
          {...register("chunkSize", { required: true })}
          type="number"
          className="input w-full"
          placeholder="Chunks size"
        />

        <button className={`btn ${loading ? 'loading' : ''}`} type="submit">
          Add
        </button>

        {embeddingCount !== null && (
          <p className="text-gray-500">
            The document will create {embeddingCount} embeddings.
          </p>
        )}
      </form>
    </>
  );
}
