// import { drawTextScreen, CanvasTextAlign, mainCanvasSize, mouseWasPressed, drawRectScreen } from "littlejsengine";
let anteBGColor = hsl(degreesToRadians(11),.6,.6)
let textColor = new Color(255,255,255,1);
class DiceStage extends StageBase {
    constructor(completedLevels, powerupManager) {
      super("dice");
  
      //Game state registers callback to invoke when level is selected
      this.levelSelectedCallback = null;
      this.backgroundColor = hsl(degreesToRadians(133), .65, .15);
      this.cameraOffset = vec2(0, -0.5);
      this.levelSize = vec2(2, 6);
      if (powerupManager.getYarnBallCount() > 0) {
        this.bet = '🧶'
        this.pirateText = "Ahoy, matey!\n\nI need a SHIP (6), CAPN (5) and CREW (4).\n\nLet's gamble for treasure, LANDLUBBER!";
      } else {
        this.bet = '?'
        this.pirateText = "Me hearty, you've nothing to BET me!\n\nI sure do like YARN BALLS though...";
      }

      this.powerupManager = powerupManager
    }
  
    init() {
      super.init();
      // setup canvas
      canvasFixedSize = vec2(1920, 1080); // 1080p
      mainCanvas.style.background = this.backgroundColor;
      // setup game
      cameraPos = this.levelSize.scale(4);
      // adjust camera scale
      cameraScale = 8;

      this.pirate = new PirateMouse(vec2(6,30));

      if (powerupManager.getYarnBallCount() > 0) {
        // init dice game!
        this.game = new ShipCapnCrew(); // true = sudden death enabled
      }

      
    }
  
    gameUpdate() {
      if (!this.state.isActive() || this.isTimedOut) return;
  
      if (mouseWasPressed(0)) {

        if(powerupManager.getYarnBallCount() == 0) { // let them see text on screen, but then exit level without losing lives so they can collect yarn 
          return this.quit()
        }

        this.isTimedOut = true;
        this.game.rollDice();
        let t0 = 1000
        setTimeout(() => {

          if (this.game.gameover) {

            this.pirateText = this.game.pirateText;

            if (this.game.player1.shipCapnCrew) {
              this.powerupManager.addYarnBalls(this.game.player1.score)
              setTimeout(() => {
                this.teardown()
                this.complete()
              }, t0);
            } else {
              if (this.game.triskaideka) {
                // this.powerupManager.setYarnBalls(0); // notso hard-core ending
                setTimeout(() => {
                  this.teardown();
                  this.instaKill();
                }, t0)
              } else {
                this.powerupManager.removeYarnBall();
                setTimeout(()=>{
                  this.teardown();
                  this.fail();
                }, t0)
              }
            }

          } else {
            this.isTimedOut = false;
          }

          
        }, t0);

      }
    }
  
    gameRenderPost() {
      if (!this.state.isActive()) return;

      ///
      ///  Parlor HUD
      ///

      ///  <pirate-talk>
      drawTextScreen(this.pirateText, vec2(mainCanvasSize.x / 2, 40), 64);

      ///  <bet>
      drawRect(vec2((mainCanvasSize.x / 16) - 165 , 35), vec2(25), anteBGColor);
      drawTextScreen(this.bet, vec2((mainCanvasSize.x / 2)-430, 450), 96);
      drawTextScreen("Ante", vec2((mainCanvasSize.x / 2)-428, 585), 32);

      ///  <score>
      if (!!this.game?.player1?.rolls >= 1) {
        drawTextScreen(`Score: ${this.game.player1.score}\n\nNo. rolls: ${this.game.player1.rolls}`, vec2((mainCanvasSize.x / 2)+500, 450), 48, textColor, 0, textColor, 'right');
      } else if (this.game?.player1?.score >= 0) {
        drawTextScreen(`Score: ${this.game.player1.score}`, vec2((mainCanvasSize.x / 2)+500, 450), 48, textColor, 0, textColor, 'right');
      }
    }

    teardown() {

      this.pirate.destroy()

      if (!!this.game) {

        this.game.player1.diceArray.forEach(d => d.destroy())

        delete this.game;
      }
    }
  }
  