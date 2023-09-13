'use client';

import { useState, createContext, useContext, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams } from "next/navigation";

export const PlayerContext = createContext();

export default function PlayerProvider({ params, children }) {
  
  const [collection, setCollection] = useState(null);
  const [videos, setVideos] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const media_id = useSearchParams().get("media");


  const supabase = createClientComponentClient();

  useEffect(() => {
    const getCollection = async () => {
      const { data: collection, error } = await supabase
        .from("collections")
        .select("*, playlists(*, media(*))")
        .eq("id", params.collection_id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      return collection;
    };

  
    const collection = getCollection();
  
    Promise.all([collection]).then((values) => {
      setCollection(values[0]);
    });

  }, [params.collection_id, supabase]);


  useEffect(() => {
    if (collection) {

      const videos =[...collection.playlists.map((playlist) => playlist.media)].flat()

      console.log("VIDEOS --------------------->", videos)

      setVideos(videos);
    }
  }, [collection]);


  useEffect(() => {
    if (videos) {
      setCurrentVideo(videos.find((video) => video.id === media_id));
    }
  }, [videos, media_id]);



  return (
    <PlayerContext.Provider
      value={{
        collection,
        videos,
        setCurrentVideo,
        currentVideo
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayerData = () => useContext(PlayerContext);
