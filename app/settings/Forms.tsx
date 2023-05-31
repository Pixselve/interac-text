"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { PineconeClient } from "@pinecone-database/pinecone";
import { useCallback, useEffect, useRef, useState } from "react";
import CreateIndexDialog from "@/components/CreateIndexDialog";
import {
  getIndexAndSetCookies,
  getIndexes,
  saveIndexToCookies,
} from "@/lib/pinecone";
import { saveApiKeyToCookies } from "@/lib/openAI";

type PineconeSettingsInputs = {
  environment: string;
  apiKey: string;
};

type IndexAndOpenAI = {
  index: string;
  openAIApiKey: string;
};

function PineconeSettingsForm({
  setPineconeIndexes,
  environment,
  apiKey,
}: {
  setPineconeIndexes: (indexes: string[]) => void;
  environment: string;
  apiKey: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PineconeSettingsInputs>({
    defaultValues: {
      environment,
      apiKey,
    },
  });

  const onSubmit: SubmitHandler<PineconeSettingsInputs> = async (data) => {
    await getPineconeIndexes(data.environment, data.apiKey);
  };

  const getPineconeIndexes = useCallback(
    async (environment: string, apiKey: string) => {
      const indexes = await getIndexAndSetCookies({ environment, apiKey });
      setPineconeIndexes(indexes);
    },
    []
  );

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <input
        className="input w-full input-bordered"
        {...register("environment", { required: true })}
        placeholder="Environment (us-east1-gcp)"
      />
      <input
        className="input w-full input-bordered"
        {...register("apiKey", { required: true })}
        placeholder="API Key (1719a9e7-c4c4-43e1-9ec2-cfba9d9d7849)"
      />

      <button className="btn" type="submit">
        Fetch indexes
      </button>
    </form>
  );
}

export default function ({
  pineconeEnvironment,
  pineconeApiKey,
  pineconeIndex,
  openAIApiKey,
  pineconeIndexes,
}: {
  pineconeEnvironment: string | undefined;
  pineconeApiKey: string | undefined;
  pineconeIndex: string | undefined;
  openAIApiKey: string | undefined;
  pineconeIndexes: string[] | null;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IndexAndOpenAI>({
    defaultValues: {
      index: pineconeIndex,
      openAIApiKey: openAIApiKey,
    },
  });

  const onIndexAndOpenAISubmit: SubmitHandler<IndexAndOpenAI> = async (
    data
  ) => {
    await saveIndexToCookies(data.index);
    await saveApiKeyToCookies(data.openAIApiKey);
    // refresh the page
    window.location.reload();
  };

  const [environment, setEnvironment] = useState(pineconeEnvironment ?? "");
  const [apiKey, setApiKey] = useState(pineconeApiKey ?? "");
  const [pineconeIndexesState, setPineconeIndexesState] =
    useState(pineconeIndexes);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function onNewIndexCreated() {
    const indexes = await getIndexAndSetCookies({ environment, apiKey });
    setPineconeIndexesState(indexes);
  }

  return (
    <div className="flex flex-col gap-10">
      <CreateIndexDialog
        environment={environment}
        apiKey={apiKey}
        onClose={() => setIsDialogOpen(false)}
        isOpen={isDialogOpen}
        onCreated={onNewIndexCreated}
      ></CreateIndexDialog>

      <h2 className="text-3xl font-bold">Pinecone</h2>

      <PineconeSettingsForm
        environment={environment}
        apiKey={apiKey}
        setPineconeIndexes={setPineconeIndexesState}
      ></PineconeSettingsForm>

      <form
        onSubmit={handleSubmit(onIndexAndOpenAISubmit)}
        className="space-y-4"
      >
        {pineconeIndexesState !== null &&
          pineconeIndexesState !== undefined && (
            <div className="space-y-4">
              <h2 className="space-x-2">
                <span>Indexes</span>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="btn btn-xs"
                  type="button"
                >
                  New index
                </button>
              </h2>

              {pineconeIndexesState.length === 0 && (
                <div className="alert alert-info shadow-lg">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current flex-shrink-0 w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>
                      You don't have any indexes yet. Create one by clicking the
                      "New index" button.
                    </span>
                  </div>
                </div>
              )}

              <ul>
                {pineconeIndexesState.map((index, i) => {
                  return (
                    <li key={index}>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <input
                            value={index}
                            type="radio"
                            {...register("index", { required: true })}
                            className="radio"
                          />
                          <span className="label-text">{index}</span>
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {errors.index && (
                <p className="text-red-500">You forgot to choose the index.</p>
              )}
            </div>
          )}

        <h1 className="text-3xl font-bold">OpenAI</h1>

        <input
          className="input w-full input-bordered"
          {...register("openAIApiKey", { required: true })}
          placeholder="OpenAI API Key"
        />
        {errors.openAIApiKey && (
          <p className="text-red-500">
            You forgot to enter the OpenAI API key.
          </p>
        )}

        <button
          className="btn"
          type="submit"
          disabled={pineconeIndexesState === null}
        >
          {pineconeIndexesState === null
            ? "You forgot to choose the index"
            : "Save"}
        </button>
      </form>
    </div>
  );
}
