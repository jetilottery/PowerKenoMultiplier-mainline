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
    var count = 0;
    var buttonMTM;
    var inGame = false;
    var moveToMoneyButtonEnable = false;
    var tryButtonEnable = false;
    var tryAgainButtonEnable = false;
    function enableButton() {
        if ((SKBeInstant.config.wagerType === 'BUY') || (Number(SKBeInstant.config.jLotteryPhase) === 1) || (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1/*-1: never. Move-To-Money-Button will never appear.*/)) {
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
            tryButtonEnable = false;
            moveToMoneyButtonEnable = false;
        } else {
            //0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
            //1..N: number of demo wagers before showing Move-To-Money-Button.
            //(Example: If value is 1, then the first time the RESULT_SCREEN state is reached, 
            //the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
            if (count >= Number(SKBeInstant.config.demosB4Move2MoneyButton)) {
                gr.lib._buy.show(false);
                gr.lib._try.show(true);
                gr.lib._buttonMTM.show(true);
                if (tryAgainButtonEnable) {
                    tryButtonEnable = false;
                } else {
                    tryButtonEnable = true;
                }
                moveToMoneyButtonEnable = true;
            } else {
                gr.lib._buy.show(true);
                gr.lib._try.show(false);
                tryButtonEnable = false;
                moveToMoneyButtonEnable = false;
            }
        }
    }

    function onStartUserInteraction() {
        inGame = true;
        if (SKBeInstant.config.gameType === 'normal') {
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
            tryButtonEnable = false;
            moveToMoneyButtonEnable = false;
        }
    }

    function onReStartUserInteraction() {
        inGame = true;
        gr.lib._buy.show(true);
        gr.lib._try.show(false);
        tryButtonEnable = false;
        moveToMoneyButtonEnable = false;
    }

    function onDisableUI() {
        gr.lib._buttonMTM.show(false);
        tryButtonEnable = false;
        moveToMoneyButtonEnable = false;
    }

    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true};
        buttonMTM = new gladButton(gr.lib._buttonMTM, config.gladButtonImgName.buttonMTM, scaleType);
        buttonMTM.show(false);
        if (config.textAutoFit.MTMText) {
            gr.lib._MTMText.autoFontFitText = config.textAutoFit.MTMText.isAutoFit;
        }

        gr.lib._MTMText.setText(loader.i18n.Game.button_move2moneyGame);
        if (config.style.MTMText) {
            gameUtils.setTextStyle(gr.lib._MTMText, config.style.MTMText);
        }
        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._MTMText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }

        if (gr.lib._tryText) {
            gameUtils.keepSameSizeWithMTMText(gr.lib._tryText, gr);
        }
        if (gr.lib._playAgainMTMText) {
            gameUtils.keepSameSizeWithMTMText(gr.lib._playAgainMTMText, gr);
        }
        function clickMTM() {
            gr.lib._try.show(false);
            tryButtonEnable = false;
            moveToMoneyButtonEnable = false;
            SKBeInstant.config.wagerType = 'BUY';
            msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
            if (config.audio && config.audio.ButtonGeneric) {
                audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            }
        }
        buttonMTM.click(clickMTM);

        gr.getTimer().setInterval(function () {
            if (moveToMoneyButtonEnable && tryButtonEnable) {
                var buttonLight = Math.floor(Math.random() * 2);
                switch (buttonLight) {
                    case 0:
                    {
                        gr.lib['_MTMAnim'].gotoAndPlay('TryButton', 0.25);
                        break;
                    }
                    case 1:
                    {
                        msgBus.publish('showTryButtonLight');
                        break;
                    }
                }
            } else if (moveToMoneyButtonEnable && tryAgainButtonEnable) {
                var buttonLight = Math.floor(Math.random() * 2);
                switch (buttonLight) {
                    case 0:
                    {
                        gr.lib['_MTMAnim'].gotoAndPlay('TryButton', 0.25);
                        break;
                    }
                    case 1:
                    {
                        msgBus.publish('showTryAgainButtonLight');
                        break;
                    }
                }
            } else if (moveToMoneyButtonEnable) {
                gr.lib['_MTMAnim'].gotoAndPlay('TryButton', 0.25);
            } else if (tryButtonEnable) {
                msgBus.publish('showTryButtonLight');
            } else if (tryAgainButtonEnable) {
                msgBus.publish('showTryAgainButtonLight');
            }
        }, 3000);

        gr.lib._buttonMTM.on('mouseover', function () {
            if (buttonMTM.getEnabled()) {
                gr.lib['_MTMAnim'].show(false);
            }
        });
        gr.lib._buttonMTM.on('mouseout', function () {
            if (buttonMTM.getEnabled()) {
                gr.lib['_MTMAnim'].show(true);
            }
        });
    }

    /*function onEnterResultScreenState() {
     count++;
     inGame = false;
     showPlayWithMoneyTimer = gr.getTimer().setTimeout(function () {
     gr.getTimer().clearTimeout(showPlayWithMoneyTimer);
     showPlayWithMoneyTimer = null;
     if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
     enableButton();
     }
     }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
     
     }*/

    function onBeginNewGame() {
        count++;
        inGame = false;
        tryAgainButtonEnable = true;
        tryButtonEnable = false;
        if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
            enableButton();
        }
    }

    function onReInitialize() {
        inGame = false;
        tryAgainButtonEnable = false;
        if (gr.lib._tutorial.pixiContainer.visible) {
            return;
        }
        enableButton();
    }

    function onTutorialIsShown() {
        gr.lib._try.show(false);
        gr.lib._buy.show(false);
        tryButtonEnable = false;
        moveToMoneyButtonEnable = false;
    }

    function onTutorialIsHide() {
        if (inGame) {
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
            tryButtonEnable = false;
            moveToMoneyButtonEnable = false;
        } else {
            enableButton();
        }
    }

    function onDisableButton() {
        gr.lib._try.show(false);
        gr.lib._buy.show(false);
        tryButtonEnable = false;
        moveToMoneyButtonEnable = false;
    }

    function onPlayerWantsPlayAgain(){
        tryAgainButtonEnable = false;
        tryButtonEnable = true;
    }
    
    msgBus.subscribe('jLotterySKB.reset', function () {
        inGame = false;
        tryAgainButtonEnable = false;
        enableButton();
    });
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    //msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);

    msgBus.subscribe('disableButton', onDisableButton);

    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    return {};
});