import { useQuery } from '@apollo/client';
import { useIsFocused, useNavigation } from '@react-navigation/core';
import { startOfDay } from 'date-fns';
import gql from 'graphql-tag';
import * as React from 'react';
import { Dimensions, RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { FAB, ProgressBar } from 'react-native-paper';
import ManifestUserSheet from '../../../components/dialogs/ManifestUser/ManifestUser';
import ManifestGroupSheet from '../../../components/dialogs/ManifestGroup/ManifestGroup';

import NoResults from '../../../components/NoResults';
import { View } from '../../../components/Themed';
import { Load, Query } from '../../../graphql/schema';
import useRestriction from '../../../hooks/useRestriction';
import { globalActions, slotForm, slotsMultipleForm, snackbarActions, useAppDispatch, useAppSelector } from '../../../redux';
import GetStarted from './GetStarted';
import LoadCard from './LoadCard';
import LoadDialog from '../../../components/dialogs/Load';

const QUERY_DROPZONE = gql`
  query QueryDropzone($dropzoneId: Int!, $earliestTimestamp: Int) {
    dropzone(id: $dropzoneId) {
      id
      name
      primaryColor,
      secondaryColor,
      planes {
        id
        name
        registration
      }
      ticketTypes {
        id
        name
      }

      currentUser {
        id
        hasCredits
        hasExitWeight
        hasMembership
        hasReserveInDate
        hasRigInspection
        hasLicense

        transactions {
          edges {
            node {
              id
              status
              amount
            }
          }
        }

        user {
          id
          name
          exitWeight
          email
          phone

          rigs {
            id
            model
            make
            serial
            canopySize
            repackExpiresAt
          }
          jumpTypes {
            id
            name
          }
          license {
            id
            name
          }
        }
      }

      loads(earliestTimestamp: $earliestTimestamp) {
        edges {
          node {
            id
            name
            loadNumber
            isOpen
            maxSlots
            isFull
          }
        }
      }
    }
  }
`;



export default function ManifestScreen() {
  const state = useAppSelector(state => state.global);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [isLoadDialogOpen, setLoadDialogOpen] = React.useState(false);
  const [isGroupDialogOpen, setGroupDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONE, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id),
      earliestTimestamp: startOfDay(new Date()).getTime() / 1000
    },
    fetchPolicy: "no-cache"
  });

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  const hasPlanes = !!data?.dropzone?.planes?.length;
  const hasTicketTypes = !!data?.dropzone?.ticketTypes?.length;
  const isPublic = !!data?.dropzone?.isPublic;
  const isSetupComplete = hasPlanes && hasTicketTypes;

  React.useEffect(() => {
    if (data?.dropzone?.id) {
      dispatch(globalActions.setDropzone(data.dropzone));
    
      dispatch(
        globalActions.setUser({
          ...state?.currentUser,
          ...(data?.dropzone?.currentUser.user || {})
        })
      );
    }
  }, [JSON.stringify(data?.dropzone)]);

  React.useEffect(() => {
    if (data?.dropzone?.primaryColor && data?.dropzone?.primaryColor !== state.theme?.colors?.primary) {
      dispatch(globalActions.setPrimaryColor(data.dropzone.primaryColor));
    }

    if (data?.dropzone?.secondaryColor && data?.dropzone?.secondaryColor !== state.theme?.colors?.accent) {
      dispatch(globalActions.setPrimaryColor(data.dropzone.secondaryColor));
    }
  }, [
    data?.dropzone?.primaryColor,
    data?.dropzone?.secondaryColor
  ])

  const allowed = useRestriction("createSlot");
  const canCreateLoad = useRestriction("createLoad");

  const onManifest = React.useCallback((load: Load) => {
    const { currentUser } = data!.dropzone;
    
    if (!currentUser.hasLicense) {
      return dispatch(
        snackbarActions.showSnackbar({
          message: "You need to select a license on your user profile",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasMembership) {
      return dispatch(
        snackbarActions.showSnackbar({
          message: "Your membership is out of date",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasRigInspection) {
      return dispatch(
        snackbarActions.showSnackbar({
          message: "Your rig needs to be inspected before manifesting",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasReserveInDate) {
      return dispatch(
        snackbarActions.showSnackbar({
          message: "Your rig needs a reserve repack",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasExitWeight) {
      return dispatch(
        snackbarActions.showSnackbar({
          message: "Update your exit weight on your profile before manifesting",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasCredits) {
      return dispatch(
        snackbarActions.showSnackbar({
          message: "You have no credits on your account",
          variant: "warning"
        })
      );
    }


    dispatch(
      slotForm.setField(["user", state.currentUser])
    );
    dispatch(
      slotForm.setField(["load", load])
    );
    setDialogOpen(true);
  }, [JSON.stringify(data?.dropzone?.currentUser)]);


  const { width } = useWindowDimensions(); 

  const numColumns = Math.ceil(width / 400) || 1;

  return (
    <>
    
    <ProgressBar visible={loading} indeterminate color={state.theme.colors.accent} />
      <View style={styles.container}>
        
        {
          !loading && (
            !isSetupComplete
              ? <GetStarted {...{ hasPlanes, hasTicketTypes, isPublic }}/>
                : <View style={{ width: "100%", flex: 1,  height: Dimensions.get("window").height }}>
                  { (data?.dropzone?.loads?.edges?.length || 0) < 1
                    ? <NoResults
                        title="No loads so far today"
                        subtitle="How's the weather?"
                      />
                    : <FlatList
                        key={`loads-columns-${numColumns}`}
                        style={{ flex: 1, height: Dimensions.get("window").height }}
                        contentContainerStyle={{ flexGrow: 1 }}
                        numColumns={numColumns}
                        data={data?.dropzone?.loads?.edges || []}
                        refreshing={loading}
                        onRefresh={refetch}
                        refreshControl={
                          <RefreshControl refreshing={loading} onRefresh={() => refetch()} />
                        }
                        renderItem={({ item: edge, index }) =>
                          !edge?.node ? null : (
                            <LoadCard
                              key={`load-${edge.node.id}`}
                              load={edge.node}
                              canManifest={allowed && edge?.node?.isOpen && !edge?.node?.isFull}
                              loadNumber={(data?.dropzone?.loads?.edges?.length || 0) - index}
                              onSlotPress={(slot) => {
                                dispatch(slotForm.setOriginal(slot));
                                dispatch(
                                  slotForm.setField(["load", edge.node!])
                                );
                                setDialogOpen(true);
                              }}
                              onSlotGroupPress={(slots) => {
                                dispatch(slotsMultipleForm.reset());
                                dispatch(slotsMultipleForm.setFromSlots(slots));
                                dispatch(slotsMultipleForm.setField(["load", edge.node!]));
                                navigation.navigate("ManifestGroupScreen");
                              }}
                              onManifest={() => onManifest(edge.node!)}
                              onManifestGroup={() => {
                                dispatch(slotsMultipleForm.reset());
                                dispatch(slotsMultipleForm.setField(["load", 
                                edge.node!]));
                                setGroupDialogOpen(true);
                              }}
                            />
                        )}
                    />
                  }

                </View>
        )}
        { canCreateLoad && isSetupComplete && (
          <FAB
            style={styles.fab}
            small
            icon="plus"
            onPress={() => setLoadDialogOpen(true)}
            label="New load"
          />
        )}
      </View>
      <ManifestUserSheet
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => setDialogOpen(false)}
      />
      <ManifestGroupSheet
        open={isGroupDialogOpen}
        onClose={() => setGroupDialogOpen(false)}
        onSuccess={() => setGroupDialogOpen(false)}
      />

      <LoadDialog
        onSuccess={() => {
          setLoadDialogOpen(false);
          refetch();
        }}
        open={isLoadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
