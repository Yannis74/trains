require(['js/app/rover'], function(Rover) {

    describe('A Rover Model', function() {
		
		var testRover;
		
        beforeEach(function() {

          testRover = {};
          testRover = new Rover({
          	location: {"x":1,"y":5},
          	position: 'S',
          	noGrid: true
          });

        });

        it('should exist', function() {
        	expect(Rover).toBeDefined();
        });

        it('should go to correct position when moving left', function() {
        	testRover.move("L");
        	expect(testRover.getPosition()).toEqual("E");
        });

        it('should go to correct position when moving right', function() {
        	testRover.move("R");
        	expect(testRover.getPosition()).toEqual("W");
        });

        it('should terminate mission if invalid commands are supplied', function(){
            testRover.move("KJKHH");
            expect(testRover.getLastLog()).toMatch('Mission terminated!');
        });

        it('should go to correct location when moving forward and maintain position', function() {
        	testRover.move('M');
        	expect(testRover.getLocation()).toEqual({"x": 1,"y": 4});
        	expect(testRover.getPosition()).toEqual("S");
        });

        it('Given a starting point of 1 2 N, performing commnds LMLMLMLMM results in location 1 3 N', function() {
        	testRover.setPosition('N');
        	testRover.setLocation({"x": 1, "y": 2});
        	testRover.move('LMLMLMLMM');
        	expect(testRover.getLocation()).toEqual({"x": 1,"y": 3});
        	expect(testRover.getPosition()).toEqual("N");
        });

    });

});
