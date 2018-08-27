pragma solidity ^0.4.23;

contract Marketplace {

    /* Define contract owner */
    address public owner;

    /* Marketplace name */
    string public marketplaceName;

    /* Map marketplace administrators */
    mapping (address => Administrator) public administratorsMapping;
    /* Save administrator addresses in an array */
    address[] public administrators;

    /* Map registered store owners */
    mapping (address => StoreOwner) public storeOwnersMapping;
    /* Save store owners addresses in an array */
    address[] public storeOwners;

    /* storeId will be used to identify stores */
    uint public storeId;
    /* Map registered stores */
    mapping (uint => Store) public storesMapping;
    /* Save stores' storeId id in an array */
    uint[] public stores;

    /* productId will be used to identify products */
    uint public productId;
    /* Map registered products */
    mapping (uint => Product) public productsMapping;
    /* Save products' productId in an array */
    uint[] public products;

    /* Enums */
    enum StoreState { Opened, Closed }


    /* Structs */
    struct Administrator {
        address addr;
        string name;
        bool isEnabled; // Enable admin permissions
    }

    struct StoreOwner {
        address addr;
        string name;
        uint balance;
        bool isEnabled; // Enable store owner permissions
    }

    struct Store {
        uint id;
        string name;
        string description;
        address storeOwner;
        StoreState state;
    }

    struct Product {
        uint id;
        string name;
        string description;
        uint price;
        uint stock;
        uint storefrontId;
    }


    /* Events */
    event specialUserWasRegistered (address specialUserAddress, string name);
    event storeWasRegistered (uint id, string name);
    event productWasRegistered (uint id, string name, uint price, uint stock, uint store);
    event productWasBought (uint id, string name, uint quantity, uint amountToPay, string store);


    /* Modifiers */
    modifier isOwner() {
        require (msg.sender == owner, "You're not the contract owner.");
        _;
    }

    modifier isAdmin() {
        require (administratorsMapping[msg.sender].isEnabled == true, "You're not a marketplace administrator.");
        _;
    }

    modifier isStoreOwnerEnabled() {
        require (storeOwnersMapping[msg.sender].isEnabled == true, "You are not able to create stores.");
        _;
    }

    modifier checkStoreExistence(uint _id) {
        require (storesMapping[_id].id == _id, "The provided storefront ID doesn't exist.");
        _;
    }
    
    modifier checkStoreOwner(uint _id) {
        require (storesMapping[_id].storeOwner == msg.sender, "You can only register products in a store you own.");
        _;
    }

    modifier checkInsertedProductInfo(uint _price, uint _stock) {
        require (_price > 0, "Product price has to be greater than zero.");
        require (_stock >= 0, "Product stock has to be equal or greater than zero.");
        _;
    }

    modifier checkProductExistenceAndQuantity(uint _id, uint _quantity) {
        require (productsMapping[_id].id == _id, "The provided product ID doesn't exist.");
        require (productsMapping[_id].stock >= _quantity, "There's not enough stock available to fullfil your order.");
        _;
    }


    constructor() public {
        /* Set the owner as the person who instantiated the contract */
        owner = msg.sender;

        /* Set the Marketplace name */
        marketplaceName = "Ethereum Marketplace";

        /* Set the inital value for storeId */
        storeId = 1;

        /* Set the inital value for produtcId */
        productId = 1;
    }


    /* Register a marketplace administrator */
    function registerAdmin(address _address, string _name) public isOwner() {
        administratorsMapping[_address] = Administrator({
            addr: _address,
            name: _name,
            isEnabled: true
        });

        administrators.push(_address); // Add registered admin address to admins array

        emit specialUserWasRegistered(_address, _name);
    }

    /* Retrieve marketplace administrators */
    function getAdmins() public view returns (address[]) {
        return administrators;
    }

    /* Register a store owner */
    function registerStoreOwner(address _address, string _name) public isAdmin() {

        storeOwnersMapping[_address] = StoreOwner({
            addr: _address,
            name: _name,
            balance: 0, // Store owners balance always start with zero
            isEnabled: true
        });

        storeOwners.push(_address); // Add registered store owner address to store owners array

        emit specialUserWasRegistered(_address, _name);
    }

    /* Retrieve store owners*/
    function getStoreOwners() public view returns (address[]) {
        return storeOwners;
    }

    /* Retrieve stores' storeId */
    function getStoreOwnerBalance(address _addr) public view returns (uint) {
        return storeOwnersMapping[_addr].balance;
    }

    /* Register a store */
    function registerStore(string _name, string _description) public isStoreOwnerEnabled() {
        
        storesMapping[storeId] = Store({
            id: storeId,
            name: _name,
            description: _description,
            storeOwner: msg.sender,
            state: StoreState.Opened
        });

        stores.push(storeId); // Add registered store ID to stores array

        emit storeWasRegistered(storeId, _name);

        storeId += 1;
    }

    /* Retrieve stores' storeId */
    function getStores() public view returns (uint[]) {
        return stores;
    }

    /* Register a product */
    function registerProduct(string _name, string _description, uint _price, uint _stock, uint _storefrontId) public
        isStoreOwnerEnabled() checkStoreExistence(_storefrontId) checkStoreOwner(_storefrontId) checkInsertedProductInfo(_price, _stock) {

        productsMapping[productId] = Product({
            id: productId,
            name: _name,
            description: _description,
            price: _price,
            stock: _stock,
            storefrontId: _storefrontId
        });

        products.push(productId); // Add registered product ID to products array

        emit productWasRegistered(productId, _name, _price, _stock, _storefrontId);

        productId += 1;
    }

    /* Retrieve products' productId */
    function getProducts() public view returns (uint[]) {
        return products;
    }

    /* Buy a product */
    function buyProduct(uint _id, uint _quantity) public payable checkProductExistenceAndQuantity(_id, _quantity) {
        uint amountToPay = productsMapping[_id].price * _quantity;

        // Only accepts the right amount, refunds cost gas ;)
        require(msg.value == amountToPay, "Please send the exact amount to finish your order.");
        
        // Decrease product stock
        productsMapping[_id].stock -= _quantity;

        // Transfer the amount to pay to the store owner
        storesMapping[productsMapping[_id].storefrontId].storeOwner.transfer(msg.value);
        
        emit productWasBought(_id, productsMapping[_id].name, _quantity, amountToPay, storesMapping[productsMapping[_id].storefrontId].name);
    }

}