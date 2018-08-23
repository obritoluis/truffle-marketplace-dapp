pragma solidity ^0.4.23;

contract Marketplace {

    /* Define contract owner */
    address public owner;

    /* Marketplace name */
    string public marketplaceName;

    /* Map marketplace administrators */
    mapping (address => Administrator) public administrators;

    /* Map registered store owners */
    mapping (address => StoreOwner) public storeOwners;

    /* storeId will be used to track stores */
    uint public storeId;
    /* Map registered stores */
    mapping (uint => Store) public stores;

    /* productId will be used to track products */
    uint public productId;
    /* Map registered products */
    mapping (uint => Product) public products;


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
        uint quantity;
        uint storefrontId;
    }


    /* Events */
    event specialUserWasRegistered (address specialUserAddress, string name);
    event storeWasRegistered (uint id, string name);
    event productWasRegistered (uint id, string name, uint price, uint store);


    /* Modifiers */
    modifier isOwner() {
        require (msg.sender == owner, "You're not the contract owner.");
        _;
    }

    modifier isAdmin() {
        require (administrators[msg.sender].isEnabled == true, "You're not a marketplace administrator.");
        _;
    }

    modifier isStoreOwnerEnabled() {
        require (storeOwners[msg.sender].isEnabled == true, "You are not able to create stores.");
        _;
    }

    modifier checkStoreExistence(uint _id) {
        require (stores[_id].id == _id, "The provided storefront ID doesn't exist.");
        _;
    }
    
    modifier checkStoreOwner(uint _id) {
        require (stores[_id].storeOwner == msg.sender, "You can only register products in a store you own.");
        _;
    }

    modifier checkInsertedProductInfo(uint _price, uint _quantity) {
        require (_price > 0, "Product price has to be greater than zero.");
        require (_quantity >= 0, "Product quantity has to be equal or greater than zero.");
        _;
    }

    modifier checkProductExistenceAndQuantity(uint _id, uint _quantity) {
        require (products[_id].id == _id, "The provided product ID doesn't exist.");
        require (products[_id].quantity >= _quantity, "There's not enough stock available to fullfil your order.");
        _;
    }


    constructor() public {
        /* Set the owner as the person who instantiated the contract */
        owner = msg.sender;

        /* Set the Marketplace name */
        marketplaceName = "Ethan Marketplace";

        /* Set the inital value for storeId */
        storeId = 1;

        /* Set the inital value for produtcId */
        productId = 1;
    }


    /* Functions */
    /* Register a marketplace administrator */
    function registerAdmin(address _address, string _name) public isOwner() {
        administrators[_address] = Administrator({
            addr: _address,
            name: _name,
            isEnabled: true
        });

        emit specialUserWasRegistered(_address, _name);
    }

    /* Register a store owner */
    function registerStoreOwner(address _address, string _name) public isAdmin() {

        storeOwners[_address] = StoreOwner({
            addr: _address,
            name: _name,
            balance: 0, // Store owners balance always start with zero
            isEnabled: true
        });

        emit specialUserWasRegistered(_address, _name);
    }

    /* Register a store */
    function registerStore(string _name, string _description) public isStoreOwnerEnabled() {
        
        stores[storeId] = Store({
            id: storeId,
            name: _name,
            description: _description,
            storeOwner: msg.sender,
            state: StoreState.Opened
        });

        emit storeWasRegistered(storeId, _name);

        storeId += 1;
    }

    /* Register a product */
    function registerProduct(string _name, string _description, uint _price, uint _quantity, uint _storefrontId) public
        isStoreOwnerEnabled() checkStoreExistence(_storefrontId) checkStoreOwner(_storefrontId) checkInsertedProductInfo(_price, _quantity) {

        products[productId] = Product({
            id: productId,
            name: _name,
            description: _description,
            price: _price,
            quantity: _quantity,
            storefrontId: _storefrontId
        });

        emit productWasRegistered(productId, _name, _price, _storefrontId);

        productId += 1;
    }

    /* Buy a product */
    function buyProduct(uint _id, uint _quantity) public checkProductExistenceAndQuantity(_id, _quantity) {
        products[_id].quantity -= _quantity;
    }

}