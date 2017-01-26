"use strict";
(function() {
  var currentGame;
  var nextToMove;
  var nextToStart = false;
  var signs;
  var twoPlayer;
  var table;
  var timer = null;
  // Waiting times in ms.
  var waitBeforeMove = 800;
  var waitAfterDraw = 2000;
  var waitBeforeNew = 4000;
  var steps = 0;
  // These variables simplify the description of the state of game.
  var lines = [];
  var rows = [];
  var columns = [];
  var allSquares = [];
  var diagonals = [[[0,0], [1,1], [2,2]], [[0,2], [1,1], [2,0]]];
  for (var i=0;i<3;i++) {
    rows[i] = [];
    columns[i] = [];
    for (var j=0;j<3;j++) {
      rows[i][j] = [j,i];
      columns[i][j] = [i,j];
      allSquares.push([i,j]);
    }
  }
  var lines = rows.concat(columns).concat(diagonals);
  var lineSums;
  
  function newGame(type) {
    clear();
    currentGame = type;
    nextToStart = !nextToStart;
    
    switch(type) {
      case 0:
        signs = ['X', 'O'];
        twoPlayer = false;
        nextToMove = nextToStart ? -1 : 1;
        break;
      case 1:
        signs = ['O', 'X'];
        twoPlayer = false;
        nextToMove = nextToStart ? 1 : -1;
        break;
      case 2:
        signs = ['X', 'O'];
        twoPlayer = true;
        nextToMove = nextToStart ? -1 : 1;
        $('.statusTextLeft').html('Next to move: ');
        $('div.status span.symbol').html(nextToStart ? 'X' : 'O');
        $('.square').addClass('clickable');
        return;
      default:
        return;
    }
    // If the computer starts...
    if (nextToMove === 1) {
      $('.statusTextLeft').html("Computer's turn!");
      timer = setTimeout(function() {
        makeMove();
        nextToMove = -1;
        $('.square:not(.clicked)').addClass('clickable');
        $('.statusTextLeft').html('Your turn!');
      }, waitBeforeMove);
    } 
    // If the player starts...
    else {
      $('.statusTextLeft').html('Your turn!');
      $('.square').addClass('clickable');
    }
  }
  
  function checkEnd() {
    var win1 = lineSums.indexOf(3);
    var win2 = lineSums.indexOf(-3);
    if (win1 >= 0) {
      highlight(lines[win1]);
      showResult(1);
      return true;
    }
    if (win2 >= 0) {
      highlight(lines[win2]);
      showResult(-1);
      return true;
    }
    if (steps === 9) {
      showResult(0);
      return true;
    }
    return false;
  }
  
  function clear() {
    clearTimeout(timer);
    table = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    lineSums = getSum(lines);
    $('.square').html('');
    $('.square').removeClass('clicked');
    $('.square').css('animation-name', '');
    $('.statusTextLeft').html('');
    $('.statusTextRight').html('');
    $('.status .symbol').html('');
    steps = 0;    
  }
  
  // Finds a random acceptable unclicked square in the given array, if exists. Otherwise returns null.
  function getEmpty(coordArray) {
    return coordArray.reduce(function(found, current) {
      if (found !== null && Math.random() > 0.5) {
        return found;
      }
      var square = $('.square')[current[0] + 3 * current[1]];
      if ($(square).hasClass('clicked') || !isAcceptable(current)) {
        return found;
      } else {
        return square;
      }
    }, null);
  }
  
  // Finds the sum of values in the 'table' matrix for the coordinates in the argument coordArray.
  function getSum(coordArray) {
    return coordArray.map(function(list) {
      return list.reduce(function(sum, item) {
        return sum + table[item[0]][item[1]];
      }, 0);
    });
  }
  
  // Animates the selected squares. Used at the end of (not drawn) games.
  function highlight(coordArray) {
    var squares = coordArray.map(function(item) {
      var square = $('.square')[item[0] + 3 * item[1]];
      return $(square);
    });
    squares.forEach(function(item) {
      item.css('animation-name', 'winner');
    });
  }
  
  function isAcceptable(move) {
    return true;
  }
  
  function makeMove() {
    var square;
    var winComp = lineSums.indexOf(2);
    var winUser = lineSums.indexOf(-2);
    // If the computer can win in this turn...
    if (winComp >= 0) {
      square = getEmpty(lines[winComp]);
    }
    // Defense...
    else if (winUser >= 0) {
      square = getEmpty(lines[winUser]);
    } 
    // Otherwise a random empty square :)
    else {
      square = getEmpty(allSquares);
    }
    var jsquare = $(square);
    var x = $.data(square, 'x');
    var y = $.data(square, 'y');
    table[x][y] = 1;
    lineSums = getSum(lines);
    jsquare.addClass('clicked');
    jsquare.html(signs[1]);
    steps++;
    $('.square:not(.clicked)').addClass('clickable');
  }
  
  // Displays the result of the game.
  function showResult(result) {
    if (result === 0) {
      $('.statusTextLeft').html('Draw!');
      $('.statusTextRight').html('');
      $('.status .symbol').html('');
      return;
    }
    if (twoPlayer) {
      $('.statusTextLeft').html('');
      $('.statusTextRight').html('wins!');
      $('.status .symbol').html(signs[(result + 1) / 2]);
      return;
    }
    $('.statusTextLeft').html(result === 1 ? 'Computer wins!' : 'You win!');
    $('.statusTextRight').html('');
    $('.status .symbol').html('');
  }
  
  $('document').ready(function() {
    $('#playX').click(function() {
      newGame(0);
    });
    $('#playO').click(function() {
      newGame(1);
    });
    $('#play2').click(function() {
      newGame(2);
    });
    $('.table').find('.square').each(function(index, item) {
      var x = index % 3;
      var y = (index - x) / 3;
      $.data(item, 'x', x);
      $.data(item, 'y', y);
    });
    $('.square').click(function(event) {
      var hsquare = event.target;
      var square = $(event.target);
      if (!square.hasClass('clickable')) {
        return;
      }
      $('.square').removeClass('clickable');
      square.addClass('clicked');
      square.html(signs[(nextToMove + 1) / 2]);
      var x = $.data(hsquare, 'x');
      var y = $.data(hsquare, 'y');
      table[x][y] = nextToMove;
      lineSums = getSum(lines);
      steps++;
      // If the game is over, we start a new one.
      if (checkEnd()) {
        timer = setTimeout(function() {
          newGame(currentGame);
        }, waitBeforeNew);
        return;
      }
      // Otherwise, we continue.
      // For two-player games...
      if (twoPlayer) {
        nextToMove *= -1;
        $('.status .symbol').html(signs[(nextToMove + 1) / 2]);
        $('.square:not(.clicked)').addClass('clickable');
      } 
      // Otherwise, the computer's turn comes...
      else {
        $('.statusTextLeft').html("Computer's turn!");
        timer = setTimeout(function() {
          makeMove();
          if (checkEnd()) {
            timer = setTimeout(function() {
              newGame(currentGame);
            }, waitAfterDraw);
            return;
          }
          $('.statusTextLeft').html('Your turn!');
        }, waitBeforeMove);
      }
    });
  });
})();