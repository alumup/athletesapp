import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PeopleTableWrapper } from "./people-table-wrapper";
import { getAccount } from "@/lib/fetchers/server";
import PersonSheet from "@/components/modal/person-sheet";

export default async function PeoplePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const account = await getAccount();

  // Fetch people server-side
  const { data: people, error } = await supabase
    .from("people")
    .select("*, relationships!relationships_person_id_fkey(*)")
    .eq("account_id", account.id);

  if (error) {
    console.error("Error fetching people:", error);
  }

  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-2">
            <h1 className="font-cal truncate text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
              People
            </h1>
          </div>
          <PersonSheet
            cta="Create Person"
            title="Create New Person"
            description="Add a new person to your account"
            account={account}
            mode="create"
          />
        </div>
        <div className="mt-10">
          <PeopleTableWrapper 
            initialPeople={people || []} 
            account={account} 
          />
        </div>
      </div>
    </div>
  );
}

