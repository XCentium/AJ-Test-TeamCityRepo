var insite = insite || {};

// Global functions that allow this JS to be called from flex.
function saveClick() {
    menuMaintenance.save();
}
function importClick() {
    // We want flex to import the file for us and send us the filename of the
    // uploaded file. Return the an object with an action member of "flexImport".
    // Otherwise do whatever and don't return anything.
    return { action: "flexImport" };
}
function hasChanges() {
    return menuMaintenance.hasChanges;
}

insite.menumaintenance = function ($) {
    "use strict";
    var that = {};

    var $availableRoles, $restrictedRoles;
    var finder, allRoles, selectedTreeNode;
    var $saveModal;
    var $saveErrorModal;
    that.selectedNodeViewModel = null;
    that.hasChanges = false;

    that.save = function() {
        $saveModal.foundation("reveal", "open");
    };

    that.setup = function (roleList) {
        that.selectedNodeViewModel = new NodeViewModel();
        that.selectedNodeViewModel.name.subscribe(function (newValue) {
            if (selectedTreeNode != null) {
                if (selectedTreeNode.title != newValue)
                    that.hasChanges = true;
                selectedTreeNode.setTitle(newValue);
            }
        });
        that.selectedNodeViewModel.target.subscribe(function (newValue) {
            if (selectedTreeNode != null) {
                if (selectedTreeNode.data.Target != newValue)
                    that.hasChanges = true;
                selectedTreeNode.data.Target = newValue;
            }
        });
        that.selectedNodeViewModel.isActive.subscribe(function (newValue) {
            if (selectedTreeNode != null) {
                if (selectedTreeNode.data.IsActive != newValue)
                    that.hasChanges = true;
                selectedTreeNode.data.IsActive = newValue;
            }
        });
        that.selectedNodeViewModel.isGlobalItem.subscribe(function (newValue) {
            if (selectedTreeNode != null) {
                if (selectedTreeNode.data.IsGlobalItem != newValue)
                    that.hasChanges = true;
                selectedTreeNode.data.IsGlobalItem = newValue;
            }
        });
        that.selectedNodeViewModel.menuType.subscribe(function (newValue) {
            if (selectedTreeNode != null) {
                if (selectedTreeNode.data.MenuType != newValue)
                    that.hasChanges = true;
                selectedTreeNode.data.MenuType = newValue;
            }
        });
        that.selectedNodeViewModel.imagePath.subscribe(function (newValue) {
            if (selectedTreeNode != null) {
                if (selectedTreeNode.data.ImagePath != newValue)
                    that.hasChanges = true;
                selectedTreeNode.data.ImagePath = newValue;
            }
        });
        ko.applyBindings(that.selectedNodeViewModel);

        allRoles = roleList;
        $("#restrictedRoles, #availableRoles").sortable({ connectWith: ".connectedSortable", receive: dropRoleOnList }).disableSelection();
        $availableRoles = $("#availableRoles");
        $restrictedRoles = $("#restrictedRoles");

        finder = new CKFinder();
        finder.basePath = "/UserFiles/";
        finder.resourceType = "ImageFiles";
        finder.selectActionFunction = function (fileUrl) { that.selectedNodeViewModel.imagePath(fileUrl); };
        $("#browseImages").click(function () {
            finder.popup();
        });

        $.post("/Console/MenuMaintenance/GetMenus", function (result) {
            setupTree(result);
        });

        $saveModal = $("#saveInProgress");
        $saveModal.find(".close-reveal-modal").hide();
        $saveModal.foundation("reveal", {
            close_on_background_click: false
        });

        $saveErrorModal = $("#saveError");
        $saveErrorModal.foundation("reveal", {
            close_on_background_click: true
        });

        $saveModal.on("opened", function () {
            $.ajax({
                url: "/console/MenuMaintenance/setmenus",
                type: "Post",
                datatype: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({ menus: $("#tree").fancytree("getTree").toDict() }),
                async: false,
                cache: false,
                success: function () {
                    menuMaintenance.hasChanges = false;
                    location.reload();

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $saveModal.find(".close-reveal-modal").click();
                    $("#saveErrorMessage").html(xhr.responseText);
                    $saveErrorModal.foundation("reveal", "open");
                }
            });
        });
    };

    var dropRoleOnList = function (event, ui) {
        that.hasChanges = true;
        selectedTreeNode.data.RestrictedRoles = new Array();
        $restrictedRoles.find("li").each(function() {
            var $this = $(this);
            selectedTreeNode.data.RestrictedRoles.push($this.text());
        });
    };

    var addRoleToList = function ($list, role) {
        $list.append("<li>" + role + "</li>");
    };

    var setupRoleLists = function (isSortable, nodeRestrictedRoles) {
        if (isSortable) {
            $("#restrictedRoles, #availableRoles").removeClass("disabled");
            $("#restrictedRoles, #availableRoles").sortable("enable");
        } else {
            $("#restrictedRoles, #availableRoles").addClass("disabled");
            $("#restrictedRoles, #availableRoles").sortable("disable");
        }

        $availableRoles.html("");
        $restrictedRoles.html("");

        allRoles.sort();
        nodeRestrictedRoles.sort();
        allRoles.forEach(function (element, index, array) {
            if (nodeRestrictedRoles.indexOf(element) > -1) {
                addRoleToList($restrictedRoles, element);
            } else {
                addRoleToList($availableRoles, element);
            }
        });
    };

    var setupTree = function (treeModel) {
        $("#tree").fancytree({
            source: treeModel,
            extensions: ["dnd", "menu"],
            activate: treeSelectNode,
            dnd: {
                autoExpandMS: 400,
                focusOnClick: true,
                preventVoidMoves: true, // Prevent dropping nodes "before self", etc.
                preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
                dragStart: dragAndDropDragStart,
                dragEnter: dragAndDropDragEnter,
                dragDrop: function (node, data) {
                    data.otherNode.moveTo(node, data.hitMode);
                },
                dragStop: function(node, data) {
                    that.hasChanges = true;
                }
            },
            menu: { selector: "#myMenu", position: { my: "center" }, beforeOpen: contextMenuSetup, select: contextMenuSelectItem }
        });

        $("#addFolder").on("click", function () {
            addNewFolder($("#tree").fancytree("getTree").getRootNode());
        });

        var rootNode = $("#tree").fancytree("getTree").getRootNode();
        if (rootNode && rootNode.children.length > 0) {
            rootNode.children[0].setActive();
        }
    };

    // View Model stuff
    function NodeViewModel() {
        this.name = ko.observable();
        this.target = ko.observable();
        this.isActive = ko.observable();
        this.isGlobalItem = ko.observable();
        this.isSystemItem = ko.observable();
        this.menuType = ko.observable();
        this.imagePath = ko.observable();
    };

    var mapNodeViewModel = function (nodeViewModel, node) {
        nodeViewModel.name(node.title);
        nodeViewModel.target(node.data.Target);
        nodeViewModel.isActive(node.data.IsActive);
        nodeViewModel.isGlobalItem(node.data.IsGlobalItem);
        nodeViewModel.isSystemItem(node.data.IsSystemItem);
        nodeViewModel.menuType(node.data.MenuType);
        nodeViewModel.imagePath(node.data.ImagePath);
    };

    // Helper functions for the menu tree.
    var treeSelectNode = function (event, data) {
        selectedTreeNode = data.node;
        mapNodeViewModel(that.selectedNodeViewModel, selectedTreeNode);
        setupRoleLists(true, selectedTreeNode.data.RestrictedRoles ? selectedTreeNode.data.RestrictedRoles : new Array());
    };

    var contextMenuSetup = function (event, data) {
        $("#myMenu li").removeClass("ui-state-disabled");
        if (data.node.data.IsSystemItem) {
            $("#myMenu li").addClass("ui-state-disabled");
        }

        if (data.node.data.MenuType != "Folder") {
            $("#myMenu li.addPage, #myMenu li.addFolder").addClass("ui-state-disabled");
        }
    };

    var addNewFolder = function (node) {
        that.hasChanges = true;
        var newFolderNode = node.addChildren({ title: "New Folder", folder: true, extraClasses: "customItem" });
        newFolderNode.data.MenuType = "Folder";
        newFolderNode.setActive();
    };

    var contextMenuSelectItem = function (event, data) {
        event.preventDefault();
        if (data.menuId == "addFolder") {
            addNewFolder(data.node);
        } else if (data.menuId == "addPage") {
            that.hasChanges = true;
            var newPageNode = data.node.addChildren({ title: "New Page", folder: false, extraClasses: "customItem" });
            newPageNode.data.MenuType = "MVC";
            newPageNode.data.Target = "/Console/SampleMvcPage";
            newPageNode.setActive();
        } else if (data.menuId == "delete") {
            that.hasChanges = true;
            data.node.remove();
        }
    };

    var dragAndDropDragStart = function (node, data) {
        return !node.data.IsSystemItem;
    };

    var dragAndDropDragEnter = function (node, data) {
        if (node.data.IsSystemItem) {
            return false;
        } else if (node.data.MenuType != "Folder") {
            return ["before", "after"];
        }
        return true;
    };

    return that;
}(jQuery);