import { gql, useMutation, useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Badge, Button, Card, DataTable, List, Menu, Paragraph, ProgressBar } from 'react-native-paper';
import addMinutes from "date-fns/addMinutes";
import differenceInMinutes from "date-fns/differenceInMinutes";

import GCAChip from '../../../components/GcaChip';
import LoadMasterChip from '../../../components/LoadMasterChip';
import PilotChip from '../../../components/PilotChip';
import PlaneChip from '../../../components/PlaneChip';

import { Text, View } from '../../../components/Themed';
import { Query, Load, Mutation, User, Plane, Slot } from '../../../graphql/schema';
import useRestriction from '../../../hooks/useRestriction';
import { useAppSelector } from '../../../redux';

interface ILoadCard {
  load: Load;
  loadNumber: number;
  canManifest: boolean;
  onSlotPress(slot: Slot): void;
  onSlotLongPress?(slot: Slot): void;
  onManifest(): void;
}


const QUERY_LOAD = gql`
  query QueryLoad($id: Int!) {
    load(id: $id) {
      id
      name
      createdAt
      dispatchAt
      hasLanded
      maxSlots
      loadNumber
      isFull
      isOpen
      plane {
        id
        name
      }
      gca {
        id
        user {
          id
          name
        }
      }
      pilot {
        id
        user {
          id
          name
        }
      }
      loadMaster {
        id
        user {
          id
          name
        }
      }
      slots {
        id
        createdAt
        exitWeight
        user {
          id
          name
        }
        ticketType {
          id
          name
          altitude

          extras {
            id
            name
            cost
          }
        }
        jumpType {
          id
          name
        }
        extras {
          id
          name
        }
      }
    }
  }
`;

const MUTATION_UPDATE_LOAD = gql`
  mutation UpdateLoad(
    $id: Int!,
    $pilotId: Int,
    $gcaId: Int,
    $planeId: Int,
    $isOpen: Boolean,
    $loadMasterId: Int,
    $dispatchAt: Int,
    $hasLanded: Boolean,
  ){
    updateLoad(input: {
      id: $id
      attributes: {
        pilotId: $pilotId,
        gcaId: $gcaId,
        planeId: $planeId,
        isOpen: $isOpen,
        loadMasterId: $loadMasterId
        dispatchAt: $dispatchAt
        hasLanded: $hasLanded
      }
    }) {
      load {
        id
        name
        createdAt
        loadNumber
        dispatchAt
        hasLanded
        maxSlots
        isFull
        isOpen
        plane {
          id
          name
        }
        gca {
          id
          user {
            id
            name
          }
        }
        pilot {
          id
          user {
            id
            name
          }
        }
        loadMaster {
          id
          user {
            id
            name
          }
        }
        slots {
          id
          createdAt
          exitWeight
          user {
            id
            name
          }
          ticketType {
            id
            name
            altitude
          }
          jumpType {
            id
            name
          }
          extras {
            id
            name
          }
        }
      }
    }
  }
`;


export default function LoadCard(props: ILoadCard) {
  const state = useAppSelector(state => state.global);
  const [isExpanded, setExpanded] = React.useState(false);
  const [isDispatchOpen, setDispatchOpen] = React.useState(false);

  const navigation = useNavigation();
  const { load, loadNumber, onManifest, canManifest } = props;
  const { data, loading } = useQuery<Query>(QUERY_LOAD, {
    variables: {
      id: Number(load.id),
    },
    // pollInterval: 30000,
  });

  const [mutationUpdateLoad, mutation] = useMutation<Mutation>(MUTATION_UPDATE_LOAD);
  const updatePilot = React.useCallback(async (pilot: User) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), pilotId: Number(pilot.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updateGCA = React.useCallback(async (gca: User) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), gcaId: Number(gca.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updatePlane = React.useCallback(async (plane: Plane) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), planeId: Number(plane.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updateLoadMaster = React.useCallback(async (lm: User) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), loadMasterId: Number(lm.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updateCall = React.useCallback(async (minutes: number | null) => {
    const dispatchTime = !minutes ? null : addMinutes(new Date(), minutes).getTime() / 1000;

    try {
      await mutationUpdateLoad({
        variables: {
          id: Number(load.id),
          dispatchAt: dispatchTime ? Math.ceil(dispatchTime) : null
        }
      });
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const onLanded = React.useCallback(async () => {
    try {
      await mutationUpdateLoad({
        variables: {
          id: Number(load.id),
          hasLanded: true,
        }
      });
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const canUpdateLoad = useRestriction("updateLoad");
  const canEditSelf = useRestriction("updateSlot");
  const canEditOthers = useRestriction("updateUserSlot");

  const getSlotPressAction = React.useCallback((slot: Slot) => {

    if (slot?.user?.id !== state.currentUser?.id && !canEditOthers) {
      return;
    }
    return () => {
      if (slot.user?.id === state.currentUser?.id) {
        if (canEditSelf) {
          props.onSlotPress(slot);
        }
      } else if (canEditOthers) {
        props.onSlotPress(slot);
      }
    }
  }, [JSON.stringify(load), canEditOthers, props.onSlotPress]);

  React.useEffect(() => {
    if (data?.load?.maxSlots && data?.load?.maxSlots < 5 && !isExpanded) {
      setExpanded(true);
    }
  }, [data?.load?.maxSlots]);

  

  return (
  <Card style={{ margin: 16 }} elevation={3}>
    <Card.Title
      title={`Load ${data?.load?.loadNumber}`}
      subtitle={load.name}
    />
    <ProgressBar
      visible={loading || mutation.loading}
      color={state.theme.colors.accent}
    />
    <Card.Content style={{ marginVertical: 8, height: isExpanded ? undefined : 300, overflow: "hidden" }}>
      <View style={{ flexDirection: "row"}}>
        <ScrollView horizontal>
          <PlaneChip
            dropzoneId={Number(state.currentDropzone?.id)}
            value={data?.load?.plane}
            onSelect={updatePlane}
          />
          <GCAChip
            dropzoneId={Number(state.currentDropzone?.id)}
            value={data?.load?.gca?.user}
            onSelect={updateGCA}
          />
          <PilotChip
            dropzoneId={Number(state.currentDropzone?.id)}
            value={data?.load?.pilot?.user}
            onSelect={updatePilot}
          />
          <LoadMasterChip
            dropzoneId={Number(state.currentDropzone?.id)}
            value={data?.load?.loadMaster?.user}
            slots={data?.load.slots || []}
            onSelect={updateLoadMaster}
          />
        </ScrollView>
      </View>
      <DataTable>
        <DataTable.Header style={{ width: "100%"}}>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title numeric>Exit weight</DataTable.Title>
          <DataTable.Title numeric>Jump type</DataTable.Title>
          <DataTable.Title numeric>Altitude</DataTable.Title>
        </DataTable.Header>
          {
            data?.load?.slots?.map(slot => {
              
              return (
                <DataTable.Row onPress={getSlotPressAction(slot)} pointerEvents="none">
                  <DataTable.Cell>{slot?.user?.name}</DataTable.Cell>
                  <DataTable.Cell numeric>{slot?.exitWeight}</DataTable.Cell>
                  <DataTable.Cell numeric>{slot?.jumpType?.name}</DataTable.Cell>
                  <DataTable.Cell numeric>{slot?.ticketType?.altitude}</DataTable.Cell>
                </DataTable.Row>
              )
            })
          }
          {
            Array.from({length: (load?.maxSlots || 0) - (load?.slots?.length || 0)}, (v, i) => i).map(() =>
              <DataTable.Row>
                <DataTable.Cell>- Available -</DataTable.Cell>
                <DataTable.Cell numeric>-</DataTable.Cell>
                <DataTable.Cell numeric>-</DataTable.Cell>
                <DataTable.Cell numeric>-</DataTable.Cell>
              </DataTable.Row>
            )
          }
      </DataTable>
    </Card.Content>
    {
      !!data?.load?.dispatchAt && data?.load?.dispatchAt > (new Date().getTime() / 1000) && (
        <View style={{ flex: 1, backgroundColor: "#FF8800", padding: 8 }}>
          <Paragraph>
            {
              `Take-off in ${differenceInMinutes(new Date(), (data?.load?.dispatchAt as number) * 1000)} min`
            }
          </Paragraph>
        </View>
    )}
    <Card.Actions>
      {
        data?.load?.maxSlots && data?.load?.maxSlots < 5 ? null :
          <Button onPress={() => setExpanded(!isExpanded)}>
            { isExpanded ? "Show less" : "Show more" }
          </Button>
      }
      <View style={{ flexGrow: 1 }} />
      {
       !canUpdateLoad || !!data?.load?.hasLanded ? null : (
      
          data?.load?.dispatchAt
            ? (
              <Button mode="outlined" onPress={() => updateCall(null)}>
                Cancel
              </Button>
            ) : (
              <Menu
                onDismiss={() => setDispatchOpen(false)}
                visible={isDispatchOpen}
                anchor={
                  <Button mode="outlined" onPress={() => setDispatchOpen(true)}>
                    Dispatch
                  </Button>
                }
              >
                <List.Item
                  onPress={() => {
                    setDispatchOpen(false);
                    updateCall(20)
                  }}
                  title="20 minute call"
                />
                <List.Item
                  onPress={() => {
                    setDispatchOpen(false);
                    updateCall(15)
                  }}
                  title="15 minute call"
                />
                <List.Item
                  onPress={() => {
                    setDispatchOpen(false);
                    updateCall(10)
                  }}
                  title="10 minute call"
                />
                <List.Item
                  onPress={() => {
                    setDispatchOpen(false);
                    updateCall(5)
                  }}
                  title="5 minute call"
                />
              </Menu>
            ))}
      
      {
        data?.load?.hasLanded ? null : (
          data?.load?.dispatchAt && data?.load.dispatchAt < new Date().getTime() / 1000 && canUpdateLoad
            ? <Button style={{ marginLeft: 8 }} mode="contained" onPress={() => onLanded()}>
                Mark as landed
              </Button>
            : <Button
                style={{marginLeft: 8 }}
                mode="contained"
                onPress={() => onManifest()}
                disabled={!canManifest || Boolean(data?.load?.dispatchAt && data.load.dispatchAt < new Date().getTime() / 1000)}
              >
                Manifest
              </Button>
        )
      }
    </Card.Actions>
  </Card>
                      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});