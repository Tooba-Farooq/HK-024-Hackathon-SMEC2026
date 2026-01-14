import lyricsgenius
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt
import re

ACCESS_TOKEN = "YHiSarbyGP4Zg-btpcd7BzSR8Z-d30CTnAs2c65_9c_mNvaJMZnw6xaKH5rW2840"  
genius = lyricsgenius.Genius(ACCESS_TOKEN)
genius.remove_section_headers = True  # to remove words other than lyrics


song_name = input("Enter the song name: ")
artist_name = input("Enter the artist name (optional): ")

song = genius.search_song(song_name, artist_name)

if song:
    lyrics = song.lyrics
    print("\n=== Lyrics ===\n")
    print(lyrics)

    # removing punctuation
    lyrics_clean = re.sub(r'[^\w\s]', '', lyrics)


    words = lyrics_clean.lower().split()
    filtered_words = []
    for word in words:
        if word not in STOPWORDS:
            filtered_words.append(word)

    text_for_cloud = ' '.join(filtered_words)

    
    cloud = WordCloud(width=800, height=400, background_color='white').generate(text_for_cloud)

    cloud.to_file("wordcloud.png")

else:
    print("Lyrics not found! Check your song name and artist.")
