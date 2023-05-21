import {cookies} from "next/headers";
import {CookiesEnum} from "@/lib/cookies";
import {redirect} from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pineconeApiKey = cookies().get(CookiesEnum.pineconeApiKey)?.value;
  const pineconeIndex = cookies().get(CookiesEnum.pineconeIndex)?.value;
  const pineconeEnvironment = cookies().get(
      CookiesEnum.pineconeEnvironment
  )?.value;

  if (!pineconeApiKey || !pineconeIndex || !pineconeEnvironment) {
    // redirect to settings
    redirect("/settings");
  }


  return <>{children}</>;
}
