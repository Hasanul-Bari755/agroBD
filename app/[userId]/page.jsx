"use client";
import Profile from "@/components/profile/profile";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
export default function Page({ params }) {
  const { data } = useSession();
  const userData = data?.user;
  const uId = params.userId;
  if (!userData) {
    redirect("/login");
  }
  const isMyOwnProfile = uId === userData._id;
  console.log(isMyOwnProfile, "is my own profile");

  return (
    <main className="px-32 py-9">
      {isMyOwnProfile ? <Profile /> : <AnotherProfile />}
    </main>
  );
}
function AnotherProfile() {
  return (
    <div>
      <h1>Another Profile</h1>
    </div>
  );
}

// export async function getServerSideProps(context){
//     const SERVER_URL = process.env.NODE_ENV === "production" ? "https://your-production-server.com" : "http://localhost:3000";

//     const { userId } = context.params;
//     console.log(userId)
//     const url = `${SERVER_URL}/api/post/${userId}`;
//     const response = await axios.get(url);
//     console.log(response.data.data,'from server');
//     return {
//         props: {
//            userData: response.data.data
//         }
//     }
// }
