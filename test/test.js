const truffleAssert = require('truffle-assertions');

var Roullette = artifacts.require("Roullette");


contract('Roullette',function(accounts){

    let roullete;
    beforeEach(async()=>{
        roullete = await Roullette.deployed();
    });

    it('shd get hash',async()=>{
        const hash = await roullete.getCommitmentHash();
        console.log(hash);
    });

    it('should set new hash with new winning number/start betting phase',async()=>{
        await roullete.setWinningNumber(12).then(
            async()=>{
                await roullete.setCommitmentHash();
                const newHash =await roullete.getCommitmentHash();
                console.log(newHash+'');
                truffleAssert.passes(newHash);
            }
        )

    });



    it('should place Bet under right conditions',async()=>{
        await roullete.depositMoney({from:accounts[0],value:360000});
        await truffleAssert.passes(roullete.placeBet([[1000,1,2,3],[100,4,5]],{from:accounts[1],value:1100}));
        await truffleAssert.reverts(roullete.placeBet([[1000,1,2,3],[100,4,5]],{from:accounts[1],value:1000}));// not enough bet total
        await truffleAssert.reverts(roullete.placeBet([[1000,1,2,3],[100,4,5]],{from:accounts[0],value:1100})); // casino player account[0] cannot play

    });

    it('should get casino deposit',async()=>{
        const deposit = await roullete.getCasinoDeposit();
        assert.equal(deposit,360000);
    })

    it('should change max Bet value',async()=>{
        const newMaxBet= 10000000;
        await roullete.setMaxBet(newMaxBet);
        const newBet = await roullete.maxBet();
        assert.equal(newBet,newMaxBet);
    })

    it('should show player bets',async()=>{
        const bets = await roullete.seeBets({from:accounts[1]});
        console.log(bets);
        truffleAssert.passes(bets);
    });

    it('should reveal winning number',async()=>{
        await roullete.revealWinningNumber(12,{from:accounts[0]}).then(
            async()=>{
                const Wn = await roullete.WinningNumber();
                assert.equal(Wn,12);
            }
        )
    });

    it('should Remove Bet',async()=>{
        truffleAssert.passes(roullete.removeBet(1,{from:accounts[1]}));
        truffleAssert.reverts(roullete.removeBet(3,{from:accounts[1]}));//Only 2 bets, index out of range,Error
    })

    it('should Reset game',async()=>{
        await roullete.gameReset();
        const phase = await roullete.getGameState();
        assert.equal(phase[0],'resetPhase');
    })



})