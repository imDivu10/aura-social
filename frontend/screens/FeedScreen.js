import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Image, TextInput, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function FeedScreen({ token, userId }) {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await axios.post(
        `${API_URL}/posts/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPosts(posts.map(p => p._id === postId ? response.data : p));
    } catch (err) {
      console.error(err);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image 
          source={{ uri: item.userId.profilePicture || 'https://via.placeholder.com/40' }}
          style={styles.profilePic}
        />
        <Text style={styles.username}>{item.userId.username}</Text>
      </View>

      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.postImage}
        />
      )}

      {item.video && (
        <View style={styles.videoContainer}>
          <Text style={styles.videoText}>🎥 Video</Text>
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => likePost(item._id)}
        >
          <Text style={styles.actionText}>
            ❤️ {item.likes.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>
            💬 {item.comments.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>
            📤 {item.shares}
          </Text>
        </TouchableOpacity>
      </View>

      {item.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.username}>{item.userId.username}</Text> {item.caption}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Feed</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        onRefresh={loadFeed}
        refreshing={refreshing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: { backgroundColor: '#1e1e2e', padding: 15, borderBottomWidth: 1, borderBottomColor: '#a78bfa' },
  headerTitle: { color: '#a78bfa', fontSize: 24, fontWeight: 'bold' },
  postContainer: { backgroundColor: '#1e1e2e', marginBottom: 10 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { color: '#a78bfa', fontWeight: 'bold', fontSize: 14 },
  postImage: { width: '100%', height: 300, backgroundColor: '#000' },
  videoContainer: { width: '100%', height: 300, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  videoText: { color: '#fff', fontSize: 24 },
  postActions: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  actionButton: { marginRight: 20 },
  actionText: { color: '#a78bfa', fontSize: 14, fontWeight: 'bold' },
  captionContainer: { padding: 12 },
  caption: { color: '#d4d4d8', fontSize: 13 }
});
