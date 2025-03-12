/**
 * @module game/exitButton
 * @description exit button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/gameUtils',
    'game/configController'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config) {
    var exitButton, homeButton;
    var whilePlaying = false;
    var isWLA = false;
    var exitInterval = null;

    function exit() {
        if (config.audio && config.audio.ButtonHome) {
            audio.play(config.audio.ButtonHome.name, config.audio.ButtonHome.channel);
        }
        msgBus.publish('jLotteryGame.playerWantsToExit');
    }

    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
        exitButton = new gladButton(gr.lib._buttonExit, config.gladButtonImgName.buttonExit, scaleType);
        isWLA = SKBeInstant.isWLA() ? true : false;
        if (config.style.exitText) {
            gameUtils.setTextStyle(gr.lib._exitText, config.style.exitText);
        }
        if (config.textAutoFit.exitText) {
            gr.lib._exitText.autoFontFitText = config.textAutoFit.exitText.isAutoFit;
        }
        gr.lib._exitText.setText(loader.i18n.Game.button_exit);

        exitButton.click(exit);
        gr.lib._buttonExit.show(false);

        exitInterval = gr.getTimer().setInterval(function () {
            gr.lib['_exitAnim'].gotoAndPlay('TryButton', 0.25);
        }, 3000);
        gr.lib._buttonExit.on('mouseover', function () {
            if (exitButton.getEnabled()) {
                gr.lib['_exitAnim'].show(false);
            }
        });
        gr.lib._buttonExit.on('mouseout', function () {
            if (exitButton.getEnabled()) {
                gr.lib['_exitAnim'].show(true);
            }
        });

        homeButton = new gladButton(gr.lib._buttonHome, config.gladButtonImgName.buttonHome, {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true});
        homeButton.click(exit);
        homeButton.show(false);
    }

    function onInitialize() {
        if (isWLA) {
            if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
                homeButton.show(false);
            } else {
                /*if (SKBeInstant.config.customBehavior && !SKBeInstant.config.customBehavior.showTutorialAtBeginning) {
                    homeButton.show(true);
                }*/
                if (SKBeInstant.config.customBehavior){
                    if(SKBeInstant.config.customBehavior.showTutorialAtBeginning === false){
                        homeButton.show(true);
                    }
                }else if(loader.i18n.gameConfig){
                    if(loader.i18n.gameConfig.showTutorialAtBeginning === false){
                        homeButton.show(true);
                    }
                }
            }
        }
    }

    /*function onEnterResultScreenState() {
        if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
            gr.getTimer().setTimeout(function () {
                gr.lib._buttonExit.show(true);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        } else {
            showExitTimer = gr.getTimer().setTimeout(function () {
                whilePlaying = false;
                if (isWLA) {
                    if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
                        homeButton.show(true);
                    }
                }
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        }
    }*/
    function onBeginNewGame() {
        if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
                gr.lib._buttonExit.show(true);
        } else {
                whilePlaying = false;
                if (isWLA) {
                    if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
                        homeButton.show(true);
                    }
                }
        }
    }

    function onReInitialize() {
        whilePlaying = false;
        if (isWLA && !gr.lib._tutorial.pixiContainer.visible) {
            homeButton.show(true);
        }
    }

    function onDisableUI() {
        if (isWLA) {
            homeButton.show(false);
        }
    }

    function onEnableUI() {
        if (Number(SKBeInstant.config.jLotteryPhase) === 2 && !whilePlaying && isWLA) {
            homeButton.show(true);
        }
    }

    function onTutorialIsShown() {
        if (isWLA) {
            homeButton.show(false);
        }
    }

    function onTutorialIsHide() {
        if (Number(SKBeInstant.config.jLotteryPhase) === 2 && !whilePlaying && isWLA) {
            homeButton.show(true);
        }
    }

    function onReStartUserInteraction() {
        whilePlaying = true;
        if (isWLA) {
            homeButton.show(false);
        }
    }
    function onStartUserInteraction() {
        whilePlaying = true;
        if (isWLA) {
            homeButton.show(false);
        }
    }
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('enableUI', onEnableUI);
    //msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLotterySKB.reset', onEnableUI);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);

    return {};
});

