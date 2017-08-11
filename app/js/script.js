
$(document).ready(function() {

  // https://github.com/js-cookie/js-cookie
  // each post id looks like: workout-series#-week#-day#


  /*
      store user's workout log
      only stores checked workouts, as 'true'
      if it's not checked it'll act as undefined

      looks like: where workout-series-week-day

      workoutLog [
        'workout-1-2-3',
        'workout-1-2-4',
      ]
  */

  let workoutLog = getWorkouts();
  console.log(workoutLog);
  processWorkouts(workoutLog)
  clearWeeks();


  // populate log from cookies
  // console.log('hey');
  // Cookies.set('name', { foo: 'bar' });
  // let storage = Cookies.getJSON('name');
  // console.log(storage.foo)



  $('.workout .trigger').on( "click", function() {
    const workout = $(this).parent();
    if( $(workout).hasClass('checked') ) {
      $(workout).removeClass('checked');
      clearWeeks();
      // remove from log
      removeFromLog($(workout).attr('id'), workoutLog);
      setWorkouts(workoutLog)
    } else {
      $(workout).appendTo($(workout).parent()).addClass('checked');
      addToLog($(workout), workoutLog);
      setWorkouts(workoutLog);
      clearWeeks();
    }
  })

});


// 
//  Process the DOM
// 

// runs through a week's workouts; folds it up if it's all donw
function clearWeeks() {
  $('.week').each(function() {
    let cleared = true;
    $(this).find('.workout:not(.checked)').each(function() {
      cleared = false;
    });
    if(!cleared) {
      $(this).removeClass('cleared');
    } else {
      $(this).addClass('cleared');
    }
  });   
}

// given a log, search all the matching IDs and set them to checked
function processWorkouts(log) {
  log.forEach(function (workout) {
    $('#'+workout).addClass('checked');
  })
}


// 
//  workout log
// 

function addToLog(workoutObj, log) {
 const series = workoutObj.data('series'), week = workoutObj.data('week'), day = workoutObj.data('day');
 const workout = `workout-${series}-${week}-${day}`

 // don't add dupes
 if ($.inArray( workout, log ) < 0 )
  log.push(workout);
}

// takes an id that matches the value
function removeFromLog(idName, log) {
  const position = $.inArray( idName, log );
  if( position > -1 ) {
    log.splice(position, 1);
  };
}



// 
//  cookie / storage handling
// 

function setWorkouts(workoutLog) {
  Cookies.set('workoutLog', workoutLog);
  console.log(Cookies.getJSON('workoutLog'))
}
function getWorkouts() {
  return Cookies.getJSON('workoutLog') || [];
}


