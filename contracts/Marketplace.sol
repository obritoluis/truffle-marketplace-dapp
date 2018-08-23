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
        string name;
        bool isEnabled; // Enable admin permissions
    }

    struct StoreOwner {
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
    modifier verifyOwner() {
        require (msg.sender == owner, "You're not the contract owner.");
        _;
    }

    modifier verifyAdmin() {
        require (administrators[msg.sender].isEnabled == true, "You're not a marketplace administrator.");
        _;
    }

    modifier isStoreOwner() {
        require (storeOwners[msg.sender].isEnabled == true, "You're not a store owner.");
        _;
    }

    modifier checkProductInfo(uint _price, uint _quantity) {
        require (_price > 0, "Product price has to be greater than zero.");
        require (_quantity >= 0, "Product quantity has to be equal or greater than zero.");
        _;
    }


    constructor() public {
        /* Set the owner as the person who instantiated the contract */
        owner = msg.sender;

        /* Set the Marketplace name */
        marketplaceName = "Ethan Marketplace";

        /* Set the inital value for storeId */
        storeId = 0;

        /* Set the inital value for produtcId */
        productId = 0;
    }


    /* Functions */
    /* Register a marketplace administrator */
    function registerAdmin(address _address, string _name) public verifyOwner {
        administrators[_address] = Administrator({
            name: _name,
            isEnabled: true
        });

        emit specialUserWasRegistered(_address, _name);
    }

    /* Register a store owner */
    function registerStoreOwner(address _address, string _name) public verifyAdmin {
        storeOwners[_address] = StoreOwner({
            name: _name,
            balance: 0, // Store owners balance always start with zero
            isEnabled: true
        });

        emit specialUserWasRegistered(_address, _name);
    }

    /* Register a store */
    function registerStore(string _name, string _description) public isStoreOwner {
        
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
        checkProductInfo(_price, _quantity) isStoreOwner {

        require (_storefrontId == "exists", "");
        require (_storefrontId == "is from msg.sender | msg.sender == storeOwner", "");

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

}