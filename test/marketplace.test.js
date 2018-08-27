var Marketplace = artifacts.require("./Marketplace.sol");

contract('Marketplace', function(accounts) {

    // Users
    const owner = accounts[0];
    const admin = [accounts[1], "John"];
    const storeOwner = [accounts[2], "Noah"];
    const shopper = accounts[3];

    // Stores
    const store1 = ["Ethereum Swag Shop", "It's not your usual shop!"];
    const store2 = ["Ethereum Surf Shop", "Riding the waves of decentralization!"];

    // Products
    const product1 = ["Plasma Shiny Hoodie", "Only for special nights!", web3.toWei(0.3, "ether"), 500, 1];
    const product2 = ["PoS Watering Waves", "Don't have a dry season again!", web3.toWei(1.1, "ether"), 250, 1];

    it("Register a marketplace administrator, add it to the administrators array and emit the event", async () => {
        const mkt = await Marketplace.deployed();

        // Register an admin
        await mkt.registerAdmin(admin[0], admin[1], {from: owner});

        // Check if it was registered correctly
        const isRegisteredAdmin = await mkt.administratorsMapping(admin[0], {from: owner});
        const isOnAdminsArray = await mkt.administrators(0, {from: owner});
        assert.equal(isRegisteredAdmin.toString(), [admin[0], admin[1], true], "Admin inserted data is not valid. Admin was not registered.");
        assert.equal(isOnAdminsArray, admin[0], "Registered admin address is not on administrators array");

        // Check if the events were emitted
        const expectedEventResult = {specialUserAddress: admin[0], name: admin[1]};
        const specialUserWasRegistered = await mkt.specialUserWasRegistered();
        const log = await new Promise(function(resolve, reject) {
            specialUserWasRegistered.watch(function(error, log){ resolve(log);});
        });
        const logSpecialUserAddress = log.args.specialUserAddress;
        const logName = log.args.name;
        assert.equal(expectedEventResult.specialUserAddress, logSpecialUserAddress, "specialUserWasRegistered event specialUserAddress property not emmitted, check admin register method");
        assert.equal(expectedEventResult.name, logName, "specialUserWasRegistered event logName property not emmitted, check admin register method");
    });

    it("Register a store owner, add it to the store owners array and emit the event", async () => {
        const mkt = await Marketplace.deployed();

        // Register a store owner
        await mkt.registerStoreOwner(storeOwner[0], storeOwner[1], {from: admin[0]});

        // Check if it was registered correctly
        const isRegisteredStoreOwner = await mkt.storeOwnersMapping(storeOwner[0], {from: admin[0]});
        const isOnStoreOwnersArray = await mkt.storeOwners(0, {from: admin[0]});
        assert.equal(isRegisteredStoreOwner.toString(), [storeOwner[0], storeOwner[1], 0, true], "Store owner inserted data is not valid. Store owner was not registered.");
        assert.equal(isOnStoreOwnersArray, storeOwner[0], "Registered store owner address is not on storeOwners array");

        // Check if the events were emitted
        const expectedEventResult = {specialUserAddress: storeOwner[0], name: storeOwner[1]};
        const specialUserWasRegistered = await mkt.specialUserWasRegistered();
        const log = await new Promise(function(resolve, reject) {
            specialUserWasRegistered.watch(function(error, log){ resolve(log);});
        });
        const logSpecialUserAddress = log.args.specialUserAddress;
        const logName = log.args.name;
        assert.equal(expectedEventResult.specialUserAddress, logSpecialUserAddress, "specialUserWasRegistered event specialUserAddress property not emmitted, check store owner register method");
        assert.equal(expectedEventResult.name, logName, "specialUserWasRegistered event logName property not emmitted, check store owner register method");
    });

    it("Register a store, add its ID to the stores array, emit the event and increase storeId by one", async () => {
        const mkt = await Marketplace.deployed();

        // Register a store
        await mkt.registerStore(store1[0], store1[1], {from: storeOwner[0]});

        // Check if it was registered correctly
        const isRegisteredStore = await mkt.storesMapping(1, {from: storeOwner[0]});
        const isOnStoresArray = await mkt.stores(0, {from: storeOwner[0]});
        assert.equal(isRegisteredStore.toString(), [1, store1[0], store1[1], storeOwner[0], 0], "Store inserted data is not valid. Store was not registered.");
        assert.equal(isOnStoresArray, 1, "Registered store is not on stores array");

        // Check if the events were emitted
        const expectedEventResult = {id: 1, name: store1[0]};
        const storeWasRegistered = await mkt.storeWasRegistered();
        const log = await new Promise(function(resolve, reject) {
            storeWasRegistered.watch(function(error, log){ resolve(log);});
        });
        const logId = log.args.id;
        const logName = log.args.name;
        assert.equal(expectedEventResult.id, logId, "storeWasRegistered event logId property not emmitted, check store register method");
        assert.equal(expectedEventResult.name, logName, "storeWasRegistered event logName property not emmitted, check store owner register method");

        // Register a store again
        await mkt.registerStore(store2[0], store2[1], {from: storeOwner[0]});
        // Get the stores array
        const registeredStoreId = await mkt.getStores(); // registeredStoreId[1] should be 2
        // Check if storestId was increased by one
        assert.equal(registeredStoreId[1].toString(), 2, "Don't forget to increase storeId by one");
    });

    it("Register a product, add its ID to the products array, emit the event and increase productId by one", async () => {
        const mkt = await Marketplace.deployed();

        // Register a product
        await mkt.registerProduct(product1[0], product1[1], product1[2], product1[3], product1[4], {from: storeOwner[0]});

        // Check if it was registered correctly
        const isRegisteredProduct = await mkt.productsMapping(1, {from: storeOwner[0]});
        const isOnProductsArray = await mkt.products(0, {from: storeOwner[0]});
        assert.equal(isRegisteredProduct.toString(), [1, product1[0], product1[1], product1[2], product1[3], product1[4]], "Product inserted data is not valid. Product was not registered.");
        assert.equal(isOnProductsArray, 1, "Registered product is not on stores array");

        // Check if the events were emitted
        const expectedEventResult = {id: 1, name: product1[0], price: product1[2], stock: product1[3], store: product1[4]};
        const productWasRegistered = await mkt.productWasRegistered();
        const log = await new Promise(function(resolve, reject) {
            productWasRegistered.watch(function(error, log){ resolve(log);});
        });
        const logId = log.args.id;
        const logName = log.args.name;
        const logPrice = log.args.price;
        const logStock = log.args.stock;
        const logStore = log.args.store;
        assert.equal(expectedEventResult.id, logId, "productWasRegistered event logId property not emmitted, check product register method");
        assert.equal(expectedEventResult.name, logName, "productWasRegistered event logName property not emmitted, check product owner register method");
        assert.equal(expectedEventResult.price, logPrice, "productWasRegistered event logPrice property not emmitted, check product owner register method");
        assert.equal(expectedEventResult.stock, logStock, "productWasRegistered event logStock property not emmitted, check product owner register method");
        assert.equal(expectedEventResult.store, logStore, "productWasRegistered event logStore property not emmitted, check product owner register method");

        // Register a product again
        await mkt.registerProduct(product2[0], product2[1], product2[2], product2[3], product2[4], {from: storeOwner[0]});
        // Get the stores array
        const registeredProductId = await mkt.getProducts(); // registeredProductId[1] should be 2
        // Check if ptoductId was increased by one
        assert.equal(registeredProductId[1].toString(), 2, "Don't forget to increase productId by one");
    });

    it("Buy a product, add its ID to the products array, emit the event and increase productId by one", async () => {
        const mkt = await Marketplace.deployed();

        // Quantity to purchase
        const quantity = 5;
        // Amount to pay (price * quantity)
        const amountToPay = web3.toWei(1.5, "ether")
        
        // Balances before purchase
        var shopperBalanceBefore = await web3.eth.getBalance(shopper).toNumber();
        var storeOwnerBalanceBefore = await web3.eth.getBalance(storeOwner[0]).toNumber();

        // Product stock before purchase
        var productBefore = await mkt.productsMapping(1, {from: storeOwner[0]});
        var productStockBefore = productBefore[4].toNumber();

        // Buy a product (productId = 1)
        await mkt.buyProduct(1, quantity, {from: shopper, value: amountToPay});

        // Balances after purchase
        var shopperBalanceAfter = await web3.eth.getBalance(shopper).toNumber();
        var storeOwnerBalanceAfter = await web3.eth.getBalance(storeOwner[0]).toNumber();

        // Verify balances
        assert.isBelow(shopperBalanceAfter, shopperBalanceBefore - parseInt(amountToPay, 10), "shopper's balance should be decreased by more than the amount paid (price * quantity + gas costs)");
        assert.equal(storeOwnerBalanceAfter, storeOwnerBalanceBefore + parseInt(amountToPay, 10), "store owner's balance should be increased by the amount paid by the shopper");

        // Product stock after purchase
        var productAfter = await mkt.productsMapping(1, {from: storeOwner[0]});
        var productStockAfter = productAfter[4].toNumber();

        // Verify stock
        assert.equal(productStockAfter, productStockBefore - quantity, "product's stock should be decreased by the quantity purchased");

    });
});