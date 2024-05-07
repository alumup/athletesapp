import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getAccount, getPrimaryContacts } from "@/lib/fetchers/server";

import { EventTable } from "./table";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreateEventModal from "@/components/modal/create-event-modal";
import IconButton from "@/components/modal-buttons/icon-button";
import { Calendar, Share } from "lucide-react";
import ShareModal from "@/components/modal/share-modal";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  async function fetchEvent() {
    const { data: events, error } = await supabase
      .from("events")
      .select("*, teams(*), events(*)")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    return events;
  }

  async function fetchParticipants() {
    const { data, error } = await supabase
      .from("rsvp")
      .select("*, people(*), profiles(*)")
      .eq("events_id", params.id);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const participantsWithPrimaryContactsPromises = data.map(
        async (participant) => {
          const primaryContacts = await getPrimaryContacts(participant.people);
          return {
            ...participant,
            people: {
              ...participant.people,
              primary_contacts: primaryContacts,
            },
          };
        },
      );
      const participantsWithPrimaryContacts = await Promise.all(
        participantsWithPrimaryContactsPromises,
      );
      console.log(participantsWithPrimaryContacts);
      return participantsWithPrimaryContacts;
    }
  }

  const event = await fetchEvent();
  const participants = await fetchParticipants();

  const account = await getAccount();

  const people = participants?.map((participant) => participant.people) || [];

  const domain =
    process.env.NODE_ENV === "production"
      ? "https://app.athletes.app"
      : "http://app.localhost:3000";
  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex flex-col space-y-0.5">
              <h1 className="text-2xl font-bold dark:text-white sm:w-auto sm:text-3xl md:text-xl">
                {event.name}
              </h1>
              <p className="w-full max-w-[700px] font-light text-gray-700">
                {event.description}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-stone-500 dark:text-stone-400">
                  {event.location?.name}
                </p>
                <p className="text-stone-500 dark:text-stone-400">
                  {event.schedule?.start_date}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            {event.visibility === "public" && (
              <IconButton
                cta=""
                icon={<Share className="h-4 w-4" />}
                className="mx-2"
              >
                <ShareModal
                  content={`${domain}/public/${account.id}/event/${event.id}`}
                />
              </IconButton>
            )}
            <GenericButton
              cta="+ New Session"
              size="default"
              variant="default"
              classNames=""
            >
              <CreateEventModal account={account} event={event} />
            </GenericButton>
          </div>
        </div>
        {!event.parent_id && (
          <div className="mt-10">
            <h2 className="mb-1 text-xs font-bold uppercase text-zinc-500">
              Sub Events
            </h2>
            <div className="flex overflow-x-auto">
              {event?.events
                ?.sort((a: any, b: any) => {
                  // Ensure both date and time are properly combined and parsed
                  const aDateTime = new Date(`${a.schedule.start_date}`);
                  const bDateTime = new Date(`${b.schedule.start_date}`);
                  return aDateTime.getTime() - bDateTime.getTime();
                })
                .map((teamEvents: any, index: number) => (
                  <Link
                    href={`/events/${teamEvents.id}`}
                    key={index}
                    className="mr-2 flex min-w-60 items-center rounded-lg border p-3 text-sm text-gray-700"
                  >
                    <Avatar className="mr-2">
                      <AvatarImage
                        src={
                          teamEvents.cover_image ||
                          "https://framerusercontent.com/images/fp8qgVgSUTyfGbKOjyVghWhknfw.jpg?scale-down-to=512"
                        }
                      />
                      <AvatarFallback className="text-black">
                        {getInitials(teamEvents.name, "")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{teamEvents.name}</h4>
                      {teamEvents?.schedule?.start_date && (
                        <div className="mb-2 flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date(
                              teamEvents.schedule.start_date,
                            ).toDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
        <div className="mt-10">
          <h2 className="mb-1 text-xs font-bold uppercase text-zinc-500">
            Participants
          </h2>

          <EventTable data={people} account={account} />
        </div>
      </div>
    </div>
  );
}
