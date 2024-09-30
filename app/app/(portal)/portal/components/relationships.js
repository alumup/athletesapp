import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const Relationships = ({ user, onDependentSelect }) => {
  const [independents, setIndependents] = useState([]);
  const [toRelationships, setToRelationships] = useState([]);
  const supabase = createClient();

  // Fetch independents
  useEffect(() => {
    const getIndependents = async () => {
      if (!user) return;

      const { data: independents, error: independentsError } = await supabase
        .from("people")
        .select("*, accounts(*)")
        .eq("dependent", false)
        .eq("email", user.email);

      if (independentsError) {
        console.error(
          "Error fetching independents: ",
          independentsError.message,
        );
        return;
      }

      setIndependents(independents);
    };

    getIndependents();
  }, [user, supabase]);

  // Fetch relationships based on independents
  useEffect(() => {
    const fetchToRelationships = async () => {
      if (independents.length === 0) return;

      let independentIds = independents.map((independent) => independent.id);

      const { data, error } = await supabase
        .from("relationships")
        .select("*, from:person_id(*),to:relation_id(*, accounts(*))")
        .in("person_id", independentIds);

      if (error) {
        console.error("Error fetching relationships: ", error.message);
        return;
      }

      setToRelationships(data);
      if (data && data.length > 0) {
        onDependentSelect(data[0]); // Automatically select the first dependent
      }
    };

    fetchToRelationships();
  }, [independents, supabase, onDependentSelect]);

  return (
    <div className="flex overflow-x-auto">
      {toRelationships.map((relation) => (
        <div
          onClick={() => onDependentSelect(relation)}
          className="mx-2 flex items-center whitespace-nowrap rounded-full border p-2 hover:cursor-pointer hover:bg-gray-100"
          key={relation.id}
        >
          <Avatar className="mr-2 h-10 w-10">
            <AvatarFallback className="text-black">
              {getInitials(relation.to?.first_name, relation.to?.last_name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{relation.to?.name || "Unnamed"}</span>
        </div>
      ))}
    </div>
  );
};

export default Relationships;
