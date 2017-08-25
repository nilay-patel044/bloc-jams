var setSong = function(songNumber) {
  if (currentSoundFile) {
      currentSoundFile.stop();
  }

  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  // #1
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
  // #2
    formats: [ 'mp3' ],
    preload: true
  });

  setVolume(currentVolume);

};


var setVolume = function(volume) {
  if (currentSoundFile) {
      currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function (number) {
    return $('.song-item-number[data-song-number ="' + currentlyPlayingSongNumber + '"]');

};

var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'
      ;

      var $row = $(template);

      var clickHandler = function() {
          var songNumber = parseInt($(this).attr('data-song-number'));

          if(currentlyPlayingSongNumber !== null) {
             // Revert to Song Number for currently playing song because user started playing new song.
             var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

             currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
             currentlyPlayingCell.html(currentlyPlayingSongNumber);
          }
          if(currentlyPlayingSongNumber !== songNumber) {
             // Switch from Play -> Pause button to indicate new song is playing.
             $(this).html(pauseButtonTemplate);
             setSong(songNumber);
             currentSoundFile.play();
             currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
             updatePlayerBarSong();
          } else if (currentlyPlayingSongNumber === songNumber) {

              if(currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
              }
              else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
              }
          }
      };

      var onHover = function(event) {
          var songNumberCell = $(this).find('.song-item-number');
          var songNumber = parseInt(songNumberCell.attr('data-song-number'));

          if (songNumber !== currentlyPlayingSongNumber) {
              songNumberCell.html(playButtonTemplate);
          }
      };
      var offHover = function(event) {

          var songNumberCell = $(this).find('.song-item-number');
          var songNumber = parseInt(songNumberCell.attr('data-song-number'));

          if (songNumber !== currentlyPlayingSongNumber) {
              songNumberCell.html(songNumber);
          }
          console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
      };

      $row.find('.song-item-number').click(clickHandler);
      $row.hover(onHover, offHover);
      return $row;
 };


var setCurrentAlbum = function(album) {
   currentAlbum = album;

   var currentSongFromAlbum = null;
   // #1
   var $albumTitle = $('.album-view-title');
   var $albumArtist = $('.album-view-artist');
   var $albumReleaseInfo = $('.album-view-release-info');
   var $albumImage = $('.album-cover-art');
   var $albumSongList = $('.album-view-song-list');

   // #2
   $albumTitle.text(album.title);
   $albumArtist.text(album.artist);
   $albumReleaseInfo.text(album.year + ' ' + album.label);
   $albumImage.attr('src', album.albumArtUrl);

   // #3
   $albumSongList.empty();

   // #4
   for (var i = 0; i < album.songs.length; i++) {
      var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
      $albumSongList.append($newRow);
   }
};


var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var nextSong = function() {
   var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
   //Note that we're _incrementing_ the song here.
   currentSongIndex++;

   if (currentSongIndex >= currentAlbum.songs.length) {
       currentSongIndex = 0;
   }

   //Save the last song number before changing it.
   var lastSongNumber = currentlyPlayingSongNumber;

   //Set a new current song.
   setSong(currentSongIndex + 1);
   currentSoundFile.play();

   //Update the Player Bar Information.
   updatePlayerBarSong();

   var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
   var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

   $nextSongNumberCell.html(pauseButtonTemplate);
   $lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {
   var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
   // Note that we're _decrementing_ the song here.
   currentSongIndex--;

   if(currentSongIndex < 0) {
     currentSongIndex = currentAlbum.songs.length - 1;
   }

   //Save the last song number before changing it.
   var lastSongNumber = currentlyPlayingSongNumber;

   //Set a new current song.
   setSong(currentSongIndex + 1);
   currentSoundFile.play();


   //Update the Player Bar Information.
   updatePlayerBarSong();

   $('.main-controls .play-pause').html(playerBarPauseButton);

   var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
   var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

   $previousSongNumberCell.html(pauseButtonTemplate);
   $lastSongNumberCell.html(lastSongNumber);
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);

    $('.main-controls .play-pause').html(playerBarPauseButton);

}


var togglePlayFromPlayerBar = function() {
    var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    if(currentSoundFile && currentSoundFile.isPaused()) {
        //Update play/pause button in cell.
        $currentlyPlayingCell.html(pauseButtonTemplate);
        //Update play/pause button in player bar using $(this) - the clicked element.
        $(this).html(playerBarPauseButton);
        currentSoundFile.play();
    }
    else if(currentSoundFile) {
        //Update play/pause button in cell.
        $currentlyPlayingCell.html(playButtonTemplate);
        //Update play/pause button in player bar using $(this) - the clicked element.
        $(this).html(playerBarPlayButton);
        currentSoundFile.pause();
    }
}


// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var albumImage = $('.album-cover-art');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar());

    //});
    var albums = [albumPicasso, albumMarconi, albumSubway];
    var index = 1;
    albumImage.click(function(event) {
    setCurrentAlbum(albums[index]);
    index++;
    if(index == albums.length){
      index = 0;
    }
    });
});
