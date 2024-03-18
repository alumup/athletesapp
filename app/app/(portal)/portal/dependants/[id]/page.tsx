"use client";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreateDependentModal from "@/components/modal/create-dependent-modal";
import CreatePersonModal from "@/components/modal/create-person-modal";
import EditPersonModal from "@/components/modal/edit-person-modal";
import { ArrowLeftIcon, GroupIcon, PlusIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { profile } from "console";
import {
  CalendarIcon,
  CheckCircle,
  Group,
  MailIcon,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Dependants = ({ params }: { params: { id: string } }) => {
  const [dependants, setDependants] = useState<any[]>([]);
  const [modalUpdate, setModalUpdate] = useState<any>(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getDependents = async () => {
      const { data, error } = await supabase
        .from("relationships")
        .select(
          "*,from:person_id(*, accounts(*)),to:relation_id(*, accounts(*))",
        )
        .eq("person_id", params.id);

      if (!error && data) setDependants(data);

      setModalUpdate(false);
    };

    getDependents();
  }, [modalUpdate]);

  return (
    <>
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white px-5 py-10 shadow">
        <div className="flex items-center justify-between">
          <Link
            href={`/portal`}
            className="cursor rounded px-6 hover:bg-gray-100"
          >
            <span className="flex items-center space-x-2 text-sm text-gray-700">
              <ArrowLeftIcon className="h-8 w-8" />
            </span>
          </Link>
          <div className="cursor-pointer rounded px-6">
            <GenericButton cta={`Add New`} size="sm" variant="outline">
              <CreateDependentModal
                person={dependants?.[0]?.from}
                modalUpdate={setModalUpdate}
              />
            </GenericButton>
          </div>
        </div>
        <div>
          <div className="bg-white p-6  md:mx-auto">
            <ul role="list" className="divide-y divide-gray-100">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    {dependants?.map((dependant) => (
                      <div key={dependant.id}>
                        <Link
                          href={`/portal/dependants/${dependant.to.id}/events`}
                        >
                          <div className="group relative my-5  overflow-hidden rounded-xl border p-5">
                            <div className="flex items-center gap-4">
                              <User className="h-32 w-32 rounded-full object-cover object-center" />
                              <div className="w-fit transform transition-all duration-500">
                                <h1 className="mb-2 text-3xl text-gray-700">
                                  {dependant.to?.name}
                                </h1>
                                <div className="flex">
                                  <CalendarIcon className="mr-2 h-5 w-5" />
                                  <p className="font-normal text-gray-600">
                                    {dependant?.to?.birthdate}
                                  </p>
                                </div>
                                <div className="flex">
                                  <MailIcon className="mr-2 h-5 w-5" />

                                  <p className="font-normal text-gray-600">
                                    {dependant?.to?.email}
                                  </p>
                                </div>
                                <div className="flex">
                                  <Users className="mr-2 h-5 w-5" />
                                  <p className="font-normal text-gray-600">
                                    {dependant?.to?.accounts?.name}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dependants;
