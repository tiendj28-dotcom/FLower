import React from "react";
import { Heart, MessageCircle, Instagram } from "lucide-react";

export default function InstagramFeedSection() {
  const images = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop",
      likes: "1.2k",
      comments: 45,
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop",
      likes: "856",
      comments: 24,
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop",
      likes: "2.5k",
      comments: 112,
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop",
      likes: "1.8k",
      comments: 89,
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop",
      likes: "945",
      comments: 32,
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
      likes: "3.1k",
      comments: 156,
    },
  ];

  const handleImageClick = () => {
    // Navigate to actual Instagram/TikTok link here
    window.open("https://www.instagram.com/", "_blank");
  };

  
}
