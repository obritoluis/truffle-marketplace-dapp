App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },
  
  initWeb3: function() {
    // Checking if Web3 has been injected by Metamask
    if (typeof web3 !== 'undefined' ) {
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
    // Check Metamask current account, check its permissions and write it on document
    function fillVisitorData(_ownerAddress) {
      var visitorAccount = web3.eth.accounts[0];
      $('#visitorAccount').text(visitorAccount);   
      if (visitorAccount == _ownerAddress) {
        $("#visitorPermissions").html("<b>Contract Owner</b>");
      } else {
        $("#visitorPermissions").html("no special");
      }
    };       

    App.contracts.Marketplace.deployed().then(function(instance) {
      // Get marketplace name
      instance.marketplaceName().then(function(result){
        $("#marketplaceName").text(result);
      });

      // Get contract owner address
      instance.owner().then(function(result){
        // Verify if the current visitor is the contract owner
        fillVisitorData(result);

        // Verify if the current Metamask account has changes and update de UI
        var accountInterval = setInterval(function() {
          if (web3.eth.accounts[0] !== visitorAccount) {
            fillVisitorData(result);
          }
        }, 100);
      });
    });

    return App.handleAdminData();
  },

  handleAdminData: function() {
    App.contracts.Marketplace.deployed().then(function(instance) {
      // Register store onwer on submit
      $("#adminForm").submit(function(event) {
        var addr = $("#adminAddress").val();
        var name = $("#adminName").val();

        instance.registerAdmin(addr, name).then(function() {
          var accountInterval = setTimeout(function() {
            location.reload(); // Refresh page (not the best way to do it)
          }, 2000);
        });

        event.preventDefault();
      });

      instance.getAdmins().then(function(adminAddresses){
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

      return true;
    });
  }

}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
