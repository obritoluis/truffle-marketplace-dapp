App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Checking if Web3 has been injected by Metamask
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected. fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    $.getJSON('Marketplace.json', function(data) {
      var MarketplaceArtifact = data;
      App.contracts.Marketplace = TruffleContract(MarketplaceArtifact);

      // Set the provider for our contract
      App.contracts.Marketplace.setProvider(App.web3Provider);

      return App.renderContractAndVisitorData(); // This has to be here to get sure the getJson response is finished
    });
  },

  renderContractAndVisitorData: function() {
    
    // Check Metamask current account    
    var visitorAccount = web3.eth.accounts[0];
    function checkVisitorAccount() {
      if (visitorAccount !== web3.eth.accounts[0]) {
        visitorAccount = web3.eth.accounts[0];
        fillDashboardData();
      }
    }
    
    // Check visitor permissions and "render"  its dashboard
    function fillDashboardData() {

      // Visitor Metamask current account
      $("#visitorAccount").text(web3.eth.accounts[0]);
      
      // Visitor Metamask current account balanace
      web3.eth.getBalance(web3.eth.accounts[0], function(err, balance) {
        $("#visitorBalance").text(web3.fromWei(balance, "ether") + " ETH");
      });

      App.contracts.Marketplace.deployed().then(function(instance) {
        
        // Get marketplace name
        instance.marketplaceName().then(function(marketplaceName) {
          $("#marketplaceName").text(marketplaceName);
        });
        
        // Check what kind of user the visitor is and the marketplace name
        CheckUsers = {
          init: function() {
            return CheckUsers.owner(instance);
          },
          owner: function(instance) {
            instance.owner().then(function(contracOwnerAddress) {
              if (contracOwnerAddress.includes(web3.eth.accounts[0])) {
                $("#visitorPermissions").text("Contract Owner");
                $(".dashboardArea").each(function() {
                  $(this).removeClass("d-block").addClass("d-none");
                });
                $("#ownerArea").removeClass("d-none").addClass("d-block");
              } else {
                return CheckUsers.admin(instance);
              }
            });
          },
          admin: function(instance) {
            instance.getAdmins().then(function(adminAddresses) {
              if (adminAddresses.includes(web3.eth.accounts[0])) {
                $("#visitorPermissions").text("Marketplace Administrator");
                $(".dashboardArea").each(function() {
                  $(this).removeClass("d-block").addClass("d-none");
                });
                $("#adminArea").removeClass("d-none").addClass("d-block");
              } else {
                return CheckUsers.storeOwner(instance);
              }
            });
          },
          storeOwner: function(instance) {
            instance.getStoreOwners().then(function(storeOwnersAddresses) {
              if (storeOwnersAddresses.includes(web3.eth.accounts[0])) {
                $("#visitorPermissions").text("Store Owner");
                $(".dashboardArea").each(function() {
                  $(this).removeClass("d-block").addClass("d-none");
                });
                $("#storeOwnerArea").removeClass("d-none").addClass("d-block");
              } else {
                return CheckUsers.shopper();
              }
            });
          },
          shopper: function() {
            $("#visitorPermissions").text("Shopper");
            $(".dashboardArea").each(function() {
              $(this).removeClass("d-block").addClass("d-none");
            });
          }
        }
        CheckUsers.init();
      });

      return App.managementArea();
    };
    fillDashboardData();

    // Verify if the current Metamask account has changes and update de UI
    setInterval(checkVisitorAccount, 100);
  },

  managementArea: function() {
    App.contracts.Marketplace.deployed().then(function(instance) {

      // Register marketplace administrator on submit
      $("#adminForm").submit(function(event) {
        event.preventDefault();

        var addr = $("#adminAddress").val();
        var name = $("#adminName").val();

        instance.registerAdmin(addr, name).then(function() {
          var accountInterval = setTimeout(function() {
            location.reload(); // Refresh page (not the best way to do it)
          }, 3000);
        });
      });

      // Get marketplace administrators
      instance.getAdmins().then(function(adminAddresses) {
        for (i = 0; i < adminAddresses.length; i++) {
          instance.administratorsMapping(adminAddresses[i]).then(function(adminArray) {
            // Administrators table
            var tableRowHtml = "<tr><td>_</td><td>_</td><td>_</td></tr>";
            for (a = 0; a < adminArray.length; a++) {
              tableRowHtml = tableRowHtml.replace("_", adminArray[a]);
            }
            $("#adminsTable").append(tableRowHtml);
          });
        }
      });

      // Register store onwer on submit
      $("#storeOwnerForm").submit(function(event) {
        event.preventDefault();

        var addr = $("#storeOwnerAddress").val();
        var name = $("#storeOwnerName").val();

        instance.registerStoreOwner(addr, name).then(function() {
          var accountInterval = setTimeout(function() {
            location.reload(); // Refresh page (not the best way to do it)
          }, 3000);
        });
      });

      // Get store owners
      instance.getStoreOwners().then(function(storeOwnersAddresses) {
        for (i = 0; i < storeOwnersAddresses.length; i++) {
          instance.storeOwnersMapping(storeOwnersAddresses[i]).then(function(storeOwnersArray) {
            // Store Owners table
            var tableRowHtml = "<tr><td>_</td><td>_</td><td>_</td><td>_</td></tr>";
            for (a = 0; a < storeOwnersArray.length; a++) {
              tableRowHtml = tableRowHtml.replace("_", storeOwnersArray[a]);
            }
            $("#storeOwnersTable").append(tableRowHtml);
          });
        }
      });

      // Register store on submit
      $("#storeForm").submit(function(event) {
        event.preventDefault();
  
        var name = $("#storeName").val();
        var description = $("#storeDescription").val();
  
        instance.registerStore(name, description).then(function() {
          var accountInterval = setTimeout(function() {
            location.reload(); // Refresh page (not the best way to do it)
          }, 3000);
        });
      });

      // Register product on submit
      $("#productForm").submit(function(event) {
        event.preventDefault();
  
        var name = $("#productName").val();
        var description = $("#productDescription").val();
        var price = $("#productPrice").val();
        var quantity = $("#productQuantity").val();
        var store = $("#productStore").val();
  
        instance.registerProduct(name, description, price, quantity, store).then(function() {
          var accountInterval = setTimeout(function() {
            location.reload(); // Refresh page (not the best way to do it)
          }, 3000);
        });
      });

      // Get stores
      instance.getStores().then(function(storesId) {
        $("#storesTable tbody").empty();

        for (i = 0; i < storesId.length; i++) {
          instance.storesMapping(storesId[i]).then(function(storesIdArray) {
            // Stores table
            var tableRowHtml = "<tr><td>_</td><td>_</td><td>_</td><td>_</td><td>_</td></tr>";
            
            if (storesIdArray.includes(web3.eth.accounts[0])) {
              for (a = 0; a < storesIdArray.length; a++) {
                tableRowHtml = tableRowHtml.replace("_", storesIdArray[a]);
              }
              $("#storesTable tbody").append(tableRowHtml);
            }
          });
        }
      });

      // Get products
      instance.getProducts().then(function(productId) {
        $("#productsTable tbody").empty();
        
        console.log($("#storesTable tbody tr td:first-child").text());

        for (i = 0; i < productId.length; i++) {
          instance.productsMapping(productId[i]).then(function(productIdArray) {
            
            var tableRowHtml = "<tr><td>_</td><td>_</td><td>_</td><td class='price'>_</td><td>_</td><td>_</td><td><input type='number' class='form-control quantity' placeholder='Quantity'></td><td><button id='buyBtn' type='button' class='btn btn-success btn-sm' aria-haspopup='true' aria-expanded='false'>Buy</button></td></tr>";

            for (a = 0; a < productIdArray.length; a++) {
              tableRowHtml = tableRowHtml.replace("_", productIdArray[a]);
            }

            $("#productsTable tbody").append(tableRowHtml);
          });
        }
      })

      // Buy product
      $("#buyBtn").submit(function(event) {
        console.log(price,quantity);
        var price = $(this).parent('td').siblings(".price").text();
        var quantity = $(this).parent('td').siblings(".quantity").val();
        console.log(price,quantity);
        instance.buyProduct(price, description).then(function() {

          var accountInterval = setTimeout(function() {
            location.reload(); // Refresh page (not the best way to do it)
          }, 3000);
        });
      });
    
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
