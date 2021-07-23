import { useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Avatar, Card, Divider, FAB, List, ProgressBar } from 'react-native-paper';

import NoResults from '../../../components/NoResults';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import { Permission, Query } from '../../../api/schema.d';
import { actions,  useAppDispatch, useAppSelector } from '../../../state';
import useRestriction from '../../../hooks/useRestriction';
import CreateGhostDialog from '../../../components/dialogs/Ghost';
import { FlatList } from 'react-native-gesture-handler';
import SkeletonContent from 'react-native-skeleton-content';

const QUERY_DROPZONE_USERS = gql`
  query QueryDropzoneUsersSearch(
    $dropzoneId: Int!
    $search: String
  ) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUsers(search: $search) {
        edges {
          node {
            id
            role {
              id
              name
            }
            user {
              id
              image
              name
            }
          }
        }
      }
    }
  }
`;


function UserCardSkeleton({ width }: { width: number }) {
  return (
    <SkeletonContent
      isLoading
      containerStyle={{
        height: 110,
        width,
        margin: 4,
      }}
      layout={[
        { key: "user-card-container", height: 110, width }
      ]}
    />
  );
}
export default function UsersScreen() {
  const global = useAppSelector(state => state.global);
  const state = useAppSelector(state => state.screens.users);
  const ghostForm = useAppSelector(state => state.forms.ghost);
  const dispatch = useAppDispatch();

  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(global.currentDropzoneId),
      search: state.searchText,
    },
    fetchPolicy: "network-only",  
  });

  const navigation = useNavigation();

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (state.isSearchVisible) {
      dispatch(actions.screens.users.setSearchVisible(false));
    }

  }, [isFocused]);


  const canCreateUser = useRestriction(Permission.CreateUser);
  const { width, height } = useWindowDimensions();

  const cardWidth = 550 + 32;
  const numColumns = Math.floor(width / cardWidth) || 1;
  const contentWidth = (cardWidth * numColumns) - 16;
  
  const users = data?.dropzone?.dropzoneUsers?.edges || [];
  const initialLoading = !users?.length && loading;

  return (
    <>
      <ProgressBar indeterminate color={global.theme.colors.accent} visible={loading} />
      <FlatList
        data={initialLoading ? [1, 1, 1, 1, 1] : users}
        onRefresh={() => refetch({
          dropzoneId: Number(global.currentDropzoneId),
          search: state.searchText,
        })}
        keyExtractor={({ item }, idx) => `user-${item?.node?.id || idx}`}
        style={{
          flex: 1,
          paddingTop: 35,
        }}
        refreshing={loading}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch}/>}
        ListEmptyComponent={() => (
          <View style={{ alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
            <NoResults title="No users" subtitle="" />
          </View>
        )}
        numColumns={numColumns}
        contentContainerStyle={{ width: contentWidth, alignSelf: "center" }}
        renderItem={({ item: edge }) => (
          edge === 1
          ? <UserCardSkeleton width={cardWidth} />
          : <Card key={`user-${edge?.node?.id}`} elevation={3} style={{ width: cardWidth, margin: 4 }}>
              <Card.Content>
                <List.Item
                  style={{ width: "100%"}}
                  title={edge?.node?.user.name}
                  description={
                    edge?.node?.role?.name?.replace('_', ' ').toUpperCase()
                  }
                  left={() =>
                    !edge?.node?.user?.image
                      ? <Avatar.Icon icon="account" style={{ alignSelf: "center", marginHorizontal: 12 }} size={32} />
                      : <Avatar.Image source={{ uri: edge?.node?.user.image }} style={{ alignSelf: "center", marginHorizontal: 12 }} size={32} />
                  }
                  right={() =>
                    <List.Icon icon="chevron-right" />
                  }
                  onPress={() => navigation.navigate("UserProfileScreen", { userId: edge?.node?.id })}
                />
              </Card.Content>
            </Card>
        )}
      />
        
       
      { canCreateUser && (
          <FAB
            style={styles.fab}
            small
            icon="plus"
            onPress={() => dispatch(actions.forms.ghost.setOpen(true))}
            label="Add user"
          />
        )}
      <CreateGhostDialog
        open={ghostForm.open}
        onClose={() => dispatch(actions.forms.ghost.setOpen(false))}
        onSuccess={() => {
          dispatch(actions.forms.ghost.setOpen(false));
          refetch();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
});