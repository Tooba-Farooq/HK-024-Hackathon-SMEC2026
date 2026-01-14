import lyricsgenius
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt
import re

# Step 1: Add your Genius API token
ACCESS_TOKEN = "YHiSarbyGP4Zg-btpcd7BzSR8Z-d30CTnAs2c65_9c_mNvaJMZnw6xaKH5rW2840"  # replace with your token
genius = lyricsgenius.Genius(ACCESS_TOKEN)
genius.remove_section_headers = True  # optional: remove [Chorus], [Verse] etc.

# Step 2: Get song info from user
song_name = input("Enter song name: ")
artist_name = input("Enter artist name (optional): ")

# Step 3: Fetch lyrics
song = genius.search_song(song_name, artist_name)

if song:
    lyrics = song.lyrics
    print("\n=== Lyrics ===\n")
    print(lyrics)

    # Step 4: Clean lyrics for word cloud
    # Remove punctuation
    clean_lyrics = re.sub(r'[^\w\s]', '', lyrics)
    # Lowercase and remove stopwords
    clean_lyrics = ' '.join([word.lower() for word in clean_lyrics.split() if word.lower() not in STOPWORDS])

    # Step 5: Generate word cloud (higher resolution looks sharper)
    wordcloud = WordCloud(width=1600, height=800, background_color='white').generate(clean_lyrics)

    wordcloud.to_file("wordcloud.png")

else:
    print("Lyrics not found! Make sure you typed the correct song and artist.")
