import { useEffect, useState } from "react";
import { getAccountWithDomain } from "../fetchers/client";
import { useParams } from "next/navigation";

const useAccount = () => {
  const [account, setAccount] = useState<any | null>(null);
  const params = useParams();

  useEffect(() => {
    getAccountWithDomain(params.domain as string).then((account) => {
      setAccount(account);
    });
  }, [params.domain]);

  return account;
};

export default useAccount;
