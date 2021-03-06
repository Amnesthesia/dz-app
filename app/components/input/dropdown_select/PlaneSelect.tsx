import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { List, Menu } from "react-native-paper";
import useCurrentDropzone from "../../../graphql/hooks/useCurrentDropzone";
import { Plane, Query } from "../../../graphql/schema.d";
import { useAppSelector } from "../../../redux";

interface IPlaneSelect {
  dropzoneId: number;
  value?: Plane | null;
  required?: boolean;
  onSelect(plane: Plane): void;
}


const QUERY_PLANES = gql`
  query QueryPlanes(
    $dropzoneId: Int!
  ) {
    planes(dropzoneId: $dropzoneId) {
      id
      name
      registration
      hours
      minSlots
      maxSlots
      nextMaintenanceHours
      createdAt
    }
  }
`;

export default function PlaneSelect(props: IPlaneSelect) {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const currentDropzone = useCurrentDropzone();

  const { data, loading, refetch } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
    }
  });
  return (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <List.Item
          onPress={() => {
            setMenuOpen(true);
          }}
          title={
            props.value?.name || "No plane selected"
          }
          description={!props.required ? "Optional" : null}
          right={() => <List.Icon icon="airplane" />}
        />
      }>
      {
        data?.planes?.map((plane) => 
          <Menu.Item
            key={`plane-select-${plane.id}`}
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(plane);
            }}
            title={
              plane.name || "-"
            }
          />
        )
      }
    </Menu>
  )
}