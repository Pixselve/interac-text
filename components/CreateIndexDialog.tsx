import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { createIndex } from "@/lib/pinecone";

type Inputs = {
  indexName: string;
};

export default function CreateIndexDialog({
  isOpen,
  onClose,
  onCreated,
  environment,
  apiKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (indexName: string) => void;
  environment: string;
  apiKey: string;
}) {
  function openDialog() {
    dialogRef.current?.showModal();
  }

  useEffect(() => {
    if (isOpen) {
      openDialog();
    }
  }, [isOpen]);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      await createIndex(data.indexName, environment, apiKey);
      onCreated(data.indexName);
      onClose();
    } catch (e) {
      // @ts-ignore
      setError("indexName", { message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="bg-base-100 text-current rounded-xl shadow p-6 space-y-4 max-w-lg backdrop:backdrop-blur-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h1>Create an Index</h1>

        <input
          {...register("indexName", { required: true })}
          className={`input w-full input-bordered
          ${errors.indexName ? "input-error" : ""}`}
          placeholder="Index name"
        />
        {errors.indexName && (
          <p className="text-error">{errors.indexName.message}</p>
        )}
        <button className={`btn btn-primary ${loading ? "loading" : ""}`}>
          Create
        </button>
      </form>
    </dialog>
  );
}
