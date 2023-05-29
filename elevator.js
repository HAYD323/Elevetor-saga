{
    init: function(elevators, floors) {
        console.clear();
        var floorTemplate = (floorNum = null) => { return { pressed: false, up: false, down: false, floorNum } };
        var floorCommandQueue = Array(floors.length).fill(1).map(floorTemplate);

        elevators.forEach( function(elevator, elevatorIndex) {
            elevator.on("idle", function() {
                var pressedFloors = floorCommandQueue.filter((floor)=>floor.pressed);
                console.log(`is idle current floor: ${elevator.currentFloor()}, total pressed floors: ${pressedFloors.length}`);
                if (pressedFloors.length > 0) {
                    console.log('pressedFloors', pressedFloors, 'elevator queue', elevator.destinationQueue);
                    var currentFloor = elevator.currentFloor();
                    var closestFloor = floorCommandQueue.reduce((prev, floor) => {
                        if (floor.pressed) {
                            floor.closest = Math.abs(floor.floorNum - currentFloor)
                        } else {
                            floor.closest = floorCommandQueue.length * 1000;
                        }
                        prev.push(floor);
                        return prev;
                    }, []).sort(({closest:a},{closest:b})=>{
                        if (a > b) {
                            return 1;
                        } else {
                            return -1;
                        }
                    })[0];

                    floorCommandQueue[closestFloor.floorNum] = floorTemplate(closestFloor.floorNum);

                    goTo(elevator, closestFloor.floorNum, true);
                    return;
                }
                console.log('going to 0');
                goTo(elevator, 0, true);
            });

            elevator.on("stopped_at_floor", function() {
                var currentFloor = elevator.currentFloor();
                floorCommandQueue[currentFloor] = floorTemplate(floorCommandQueue[currentFloor].floorNum);
                // if (elevator.destinationQueue.length > 1) {
                //     console.log('elevator.destinationQueue', elevator.destinationQueue, 'elevatorIndex', elevatorIndex);
                //     elevator.goingUpIndicator(elevator.destinationDirection() == "up");
                //     elevator.goingDownIndicator(elevator.destinationDirection() == "down");
                //     return 
                // }
                if (elevator.destinationDirection() == "stopped") {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(true);
                }
            })

            elevator.on("floor_button_pressed", function(floorNum) {
                var _queue = elevator.getPressedFloors() || [];
                if (_queue.length > 1) {
                    _queue.forEach((floorNum) => {
                        floorCommandQueue[floorNum] = floorTemplate(floorNum);
                    });
                    elevator.destinationQueue = _queue;
                    elevator.checkDestinationQueue();
                } else {
                    goTo(elevator,floorNum);
                }
            });
        });


        floors.forEach( function(floor, index) {
            floorCommandQueue[index].floorNum = index;

            floor.on("up_button_pressed", function(floor) {
                floorCommandQueue[floor.level].pressed = true;
                floorCommandQueue[floor.level].up = true;
            });
            floor.on("down_button_pressed", function(floor) {
                floorCommandQueue[floor.level].pressed = true;
                floorCommandQueue[floor.level].down = true;
            })
        });



        function goTo(elevator, floorNum, idle) {
            var currentFloor = elevator.currentFloor();

            if (idle) {
                elevator.goingUpIndicator(true);
                elevator.goingDownIndicator(true);
            } else {
                if (floorNum > currentFloor) {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                } else {
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(true);
                }
            }
            elevator.goToFloor(floorNum);
            return floorNum
        }
    },
    update: function(dt, elevators, floors) {
    }
}