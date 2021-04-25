import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import { List, Menu } from "react-native-paper";
import { Federation, Query } from "../graphql/schema";


interface IFederationSelect {
  value?: Federation | null;
  required?: boolean;
  onSelect(jt: Federation): void;
}

const QUERY_FEDERATIONS = gql`
  query Federations {
    federations {
      id
      name
    }
  }
`;

export default function FederationSelect(props: IFederationSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const { data } = useQuery<Query>(QUERY_FEDERATIONS);

  useEffect(() => {
    if (data?.federations?.length === 1 && !props.value) {
      props.onSelect(data.federations![0]);
    }
  }, [JSON.stringify(data?.federations)])

  return (
    <>
    <List.Subheader>
      Federation
    </List.Subheader>
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <List.Item
          onPress={() => {
            setMenuOpen(true);
          }}
          title={
            props.value?.name || "Please select federation"
          }
          description={!props.required ? "Optional" : null}
        />
      }>
      {
        data?.federations?.map((federation) => 
          <List.Item
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(federation);
            }}
            title={
              federation.name || "-"
            }
          />
        )
      }
    </Menu>
    </>
  )
}