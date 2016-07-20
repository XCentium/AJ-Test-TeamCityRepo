var insite = insite || {};

insite.contentAdmin.tree = function($) {
    "use strict";

    var $shell;
    var $contentTree;

    var nodeMenuParameters;

    var that = {};

    that.setup = function (options) {
        nodeMenuParameters = options.nodeMenuParameters;

        $shell = options.shell;
        that.setupFilterBox();

        $contentTree = $(".cms-contentTree");
        var activateNode = function (nodeElement) {
            var node = ko.dataFor(nodeElement);
            insite.contentAdmin.shellViewModel.ContentTree.ActiveNode(ko.mapping.fromJS(ko.mapping.toJS(node)));
            if (node.Key.indexOf("LOADMORE-") > -1) {
                $.get(node.Url, function (result) {
                    var parentNode = ko.dataFor($(nodeElement).parents("li:first").parents("li:first")[0]);
                    parentNode.Children.pop();
                    for (var x = 0; x < result.Children.length; x++) {
                        parentNode.Children.push(new contentTreeNode(result.Children[x]));
                    }

                });
                return;
            }

            insite.contentAdmin.loadIfNewUrl(node.Url);

        };
        $contentTree.on("click", ".fancytree-icon, .fancytree-title", function (e) {
            activateNode(this);
        });
        $contentTree.on("click", ".fancytree-expander", function (e) {
            var $this = $(this);
            var node = ko.dataFor(this);
            var finish = function () {
                if (node.Children().length > 0) {
                    var indexOf = insite.contentAdmin.shellViewModel.ContentTree.ExpandedNodes.indexOf(node.Key);
                    if (indexOf >= 0) {
                        insite.contentAdmin.shellViewModel.ContentTree.ExpandedNodes.splice(indexOf, 1);
                    } else {
                        insite.contentAdmin.shellViewModel.ContentTree.ExpandedNodes.push(node.Key);
                    }
                }
            }
            if (!node.ChildrenLoaded) {
                var key = "";
                if (node.Key !== "ROOT-Categories" && node.Key !== "ROOT-Templates") {
                    key = node.Key;
                }

                var rootNode;

                $this.parents("li").each(function () {
                    if (rootNode !== null) {
                        var $parentLi = $(this);
                        if ($parentLi.parent().hasClass("ui-fancytree")) {
                            rootNode = ko.dataFor(this);
                        }
                    }
                });

                node.Children.push(new contentTreeNode({
                    Title: "Loading",
                    Key: "LOAD-" + node.Key,
                    CssClass: "sec-loading",
                    HasChildren: false,
                    IsLink: false,
                    Children: [],
                    LoadChildrenUrl: "",
                    ChildrenLoaded: true,
                    MenuUrls: [],
                    Url: ""
                }));

                node.ChildrenLoaded = true;
                finish();

                $.get(rootNode.LoadChildrenUrl + key, function (result) {
                    node.Children.removeAll();
                    for (var x = 0; x < result.Children.length; x++) {
                        node.Children.push(new contentTreeNode(result.Children[x]));
                    }
                });
            } else {
                finish();
            }

        });

        $(window).blur(function(e) {
            $contentTree.find(".cms-actionsMenu").hide();
        });
        $(document).click(function (e) {
            $contentTree.find(".cms-actionsMenu").hide();
        });

        $contentTree.on("click", ".cms-openActionsMenu", function (e) {
            e.stopPropagation();
            activateNode(this);
            var $actionsMenu = $contentTree.find(".cms-actionsMenu");
            var $this = $(this);
            $actionsMenu.css("top", $this.parent().offset().top)
                .css("left", $this.parent().offset().left + $this.parent().outerWidth())
                .show();
        });

        $.get($shell.attr("data-contentTreeNodesUrl"), function (result) {
            for (var x = 0; x < result.ContentTreeNodes.length; x++) {
                insite.contentAdmin.shellViewModel.ContentTreeNodes.push(new contentTreeNode(result.ContentTreeNodes[x]));
            }
        });

        insite.contentAdmin.shellViewModel.TreeFilters.subscribe(function () {
            insite.contentAdmin.tree.applyFilters();
        });
    };

    that.setupFilterBox = function() {
        var $autoCompleteBox = $(".filterAutocomplete");

        var filterUrl = $autoCompleteBox.attr("data-actionLink");
        $.get(filterUrl + "?q=laksjdfoiasdf");

        $autoCompleteBox.val("");
        var $container = $("<div class='ac_input_container'></div>");
        $autoCompleteBox.replaceWith($container);
        $container.append($autoCompleteBox);
        var $filterImage = $("<span class='sec-loading'></span>");
        $autoCompleteBox.before($filterImage);

        var showSelector = function() {
            var createSelector = function (value) {
                return ["<span class='initialSelector'>" + value + "</span>"];
            }

            if ($autoCompleteBox.val() === "") {
                $autoCompleteBox[0].autocompleter.showData([createSelector("Language"), createSelector("Persona"), createSelector("Device"), createSelector("Status")]);
            }
        }

        $autoCompleteBox.click(function(e) {
            showSelector();
        });

        $autoCompleteBox.autocomplete(filterUrl, {
            onKeyPress: function(e) {
                if ($autoCompleteBox.val() !== "") {
                    $filterImage.show();
                }
            },
            underMinChars: function() {
                $filterImage.hide();
            },
            onItemSelect: function(listItem) {
                var $selectValue = $(listItem.selectValue);

                if ($selectValue.hasClass("noAction")) {
                    $autoCompleteBox.focus();
                    return;
                }
                if ($selectValue.hasClass("goBack")) {
                    $autoCompleteBox.val("");
                    showSelector();
                    return;
                }

                if ($selectValue.hasClass("initialSelector")) {
                    $autoCompleteBox.val($selectValue.text());
                    $autoCompleteBox.focus();
                    $autoCompleteBox[0].autocompleter.loadData();
                    return;
                }

                $autoCompleteBox.val("");

                insite.contentAdmin.shellViewModel.AddFilter({
                    Value: $selectValue.attr("data-value"),
                    Key: $selectValue.attr("data-key"),
                    Type: $selectValue.attr("data-type")
                });
                $autoCompleteBox.focus();
            },
            onShowResults: function(results) {
                $autoCompleteBox[0].autocompleter.flushCache();
                $filterImage.hide();
                var $results = $(results);
                $results.css("left", $autoCompleteBox.offset().left);

                var offSetTop = $autoCompleteBox.offset().top;
                if ($(".ie8").size() > 0) {
                    offSetTop += $("html").scrollTop();
                }

                $results.css("top", offSetTop + $autoCompleteBox.outerHeight());
                $results.find(".noAction").parent().addClass("noAction");

                $results.width($autoCompleteBox.outerWidth());
            },
            minChars: 1
        });
    };

    that.update = function () {
        that.applyFilters(false);
        for (var x = 0; x < insite.contentAdmin.shellViewModel.ContentTreeNodes().length; x++) {
            var node = insite.contentAdmin.shellViewModel.ContentTreeNodes()[x];
            if (node.Key == "ROOT-Templates") {
                var templateNode = node;
                $.get(node.LoadChildrenUrl, function (result) {
                    templateNode.Children.removeAll();
                    templateNode.ChildrenLoaded = true;
                    templateNode.HasChildren(result.Children.length > 0);
                    for (var x = 0; x < result.Children.length; x++) {
                        templateNode.Children.push(new contentTreeNode(result.Children[x]));
                    }
                });
            }
        }
    };

    that.applyFilters = function (expandAllNodes) {
        expandAllNodes = typeof (expandAllNodes) !== "undefined" ? expandAllNodes : true;
        var filtersArray = insite.contentAdmin.shellViewModel.TreeFilters();
        var filters = "";
        for (var x = 0; x < filtersArray.length; x++) {
            filters += "filters[" + x + "].Type=" + filtersArray[x].Type + "&filters[" + x + "].Key=" + filtersArray[x].Key + "&";
        }

        $.get($shell.attr("data-filtercontenttreenodesurl") + "?" + filters, function (result) {
            var expandNodes = function (nodeToExpand) {
                if (nodeToExpand.HasChildren) {
                    if (insite.contentAdmin.shellViewModel.ContentTree.ExpandedNodes.indexOf(nodeToExpand.Key) < 0) {
                        insite.contentAdmin.shellViewModel.ContentTree.ExpandedNodes.push(nodeToExpand.Key);
                    }
                    for (var x = 0; x < nodeToExpand.Children.length; x++) {
                        expandNodes(nodeToExpand.Children[x]);
                    }
                }
            };

            var updateNodeIfNeeded = function(indexOfNode, currentNode, returnedNode) {
                if (currentNode.Key === returnedNode.Key) {
                    insite.contentAdmin.shellViewModel.ContentTreeNodes.splice(indexOfNode, 1, new contentTreeNode(returnedNode));
                    if (expandAllNodes) {
                        expandNodes(returnedNode);
                    }
                }
            }

            for (var x = 0; x < insite.contentAdmin.shellViewModel.ContentTreeNodes().length; x++) {
                var node = insite.contentAdmin.shellViewModel.ContentTreeNodes()[x];
                updateNodeIfNeeded(x, node, result.HomePage);
                updateNodeIfNeeded(x, node, result.Footer);
                updateNodeIfNeeded(x, node, result.Header);
            }
        });
    };

    //trying to get this working with the standard ko.mapping was going nowhere, we load up the nodes in too many different ways. 
    //In the long run the benefit from not having everything observable may be negated by the overhead of not using the standard mapping
    var contentTreeNode = function (data) {
        var self = this;
        self.Title = ko.observable(data.Title);
        self.ChildrenLoaded = false;
        self.Children = ko.observableArray();
        if (data.Children !== null) {
            for (var x = 0; x < data.Children.length; x++) {
                self.Children.push(new contentTreeNode(data.Children[x]));
            }
            self.ChildrenLoaded = true;
        }

        self.HasChildren = ko.observable(data.HasChildren);
        self.LoadChildrenUrl = data.LoadChildrenUrl;
        self.BaseCssClass = data.BaseCssClass;
        self.CssClass = data.CssClass;
        self.Key = data.Key;
        self.MenuUrls = null;
        self.Url = data.Url;
        self.Type = data.Type;
        self.IsExpanded = ko.computed(function () {
            return insite.contentAdmin.shellViewModel.ContentTree.ExpandedNodes().indexOf(self.Key) >= 0;
        });
        self.GenerateCssClasses = ko.computed(function() {
            return (insite.contentAdmin.shellViewModel.ContentTree.ActiveNode().Key() == self.Key ? "fancytree-active " : "")
                + (self.HasChildren() && !self.IsExpanded() ? "fancytree-exp-cl " : "")
                + (self.HasChildren() && self.IsExpanded() ? "fancytree-exp-el " : "")
                + (!self.HasChildren() ? "fancytree-exp-n " : "")
                + (self.HasChildren() ? "fancytree-has-children " : "")
                + (self.CssClass);
        });

        self.MenuUrls = [];
        if (self.Type === "ContentPage" || self.Type === "LinkedContentPage") {
            if (nodeMenuParameters.AllowModification) {
                self.MenuUrls.push({ Title: "Add Page", Url: nodeMenuParameters.AddUrl + self.Key, IsModal: false });
            }
            if (nodeMenuParameters.AllowAddLink) {
                self.MenuUrls.push({ Title: "Add Linked Page", Url: nodeMenuParameters.AddLinkUrl + self.Key, IsModal: false });
            }
            if (nodeMenuParameters.AllowModification && self.Type !== "LinkedContentPage") {
                self.MenuUrls.push({ Title: "Edit Page", Url: nodeMenuParameters.EditUrl + self.Key, IsModal: false });
            }
            if (nodeMenuParameters.AllowModification && self.Type === "LinkedContentPage") {
                self.MenuUrls.push({ Title: "Unlink/Copy Page", Url: nodeMenuParameters.UnlinkUrl + self.Key, IsModal: false });
            }
            if (nodeMenuParameters.AllowDelete) {
                self.MenuUrls.push({ Title: "Delete Page", Url: nodeMenuParameters.DeleteUrl + self.Key, IsModal: true });
            }
        }
        
        else if (self.Type === "Header" || self.Type === "Footer") {
            if (nodeMenuParameters.AllowModification) {
                self.MenuUrls.push({ Title: "Edit Page", Url: nodeMenuParameters.EditUrl + self.Key, IsModal: false });
            }
        }

        else if (self.Type === "LinkedHeader") {
            if (nodeMenuParameters.AllowModification) {
                self.MenuUrls.push({ Title: "Unlink/Copy Header", Url: nodeMenuParameters.UnlinkUrl + self.Key, IsModal: false });
            }
        }

        else if (self.Type === "LinkedFooter") {
            if (nodeMenuParameters.AllowModification) {
                self.MenuUrls.push({ Title: "Unlink/Copy Footer", Url: nodeMenuParameters.UnlinkUrl + self.Key, IsModal: false });
            }
        }

        else if (self.Type === "Templates") {
            self.MenuUrls.push({ Title: "Add", Url: nodeMenuParameters.AddTemplateLink, IsModal: false });
        }

        else if (self.Type === "Template") {
            self.MenuUrls.push({ Title: "Edit", Url: nodeMenuParameters.EditUrl + self.Key, IsModal: false });
            self.MenuUrls.push({ Title: "Delete", Url: nodeMenuParameters.DeleteUrl + self.Key, IsModal: true });
        }

    };

    return that;
}(jQuery);