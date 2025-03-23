              <UILabel htmlFor="propDescription">Property Description</UILabel>
              <Input
                id="propDescription"
                value={newProperty.description || ""}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, description: e.target.value })
                }
                placeholder="Human-readable description of this property"
              />
            </div>

            {newProperty.type === "Reference" && (
              <div className="grid grid-cols-2 gap-4 mt-2 p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                <div className="col-span-2">
                  <h4 className="font-medium mb-2">Reference Configuration</h4>
                </div>
                <div>
                  <UILabel htmlFor="refEntity">Referenced Entity</UILabel>
                  <Select
                    value={selectedRefEntity}
                    onValueChange={setSelectedRefEntity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.title || table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <UILabel htmlFor="refType">Reference Type</UILabel>
                  <Select
                    value={String(selectedRefType)}
                    onValueChange={(value) => 
                      setSelectedRefType(Number(value) as RefType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reference type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(RefType.OneToOne)}>
                        <div className="flex flex-col">
                          <span>OneToOne</span>
                          <span className="text-xs text-muted-foreground">Each record has exactly one match (1:1)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={String(RefType.OneToMany)}>
                        <div className="flex flex-col">
                          <span>OneToMany</span>
                          <span className="text-xs text-muted-foreground">This entity has many related records (1:N)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={String(RefType.ManyToOne)}>
                        <div className="flex flex-col">
                          <span>ManyToOne</span>
                          <span className="text-xs text-muted-foreground">Many of this entity refer to one record (N:1)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={String(RefType.ManyToMany)}>
                        <div className="flex flex-col">
                          <span>ManyToMany</span>
                          <span className="text-xs text-muted-foreground">Many-to-many relationship (N:N)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Defines how records in this entity relate to records in the referenced entity.
                  </p>
                </div>
                
                <div className="col-span-2">
                  <UILabel htmlFor="refPropName">Reference Property Name</UILabel>
                  <div className="flex gap-2">
                    <Input
                      id="refPropName"
                      value={refEntityPropName}
                      onChange={handleRefPropNameChange}
                      onBlur={handleRefPropNameBlur}
                      placeholder="e.g., customerOrders"
                      className={!isRefPropNameValid ? "border-red-500" : ""}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (selectedRefEntity) {
                          const entity = tables.find(t => t.id === selectedRefEntity);
                          if (entity) {
                            const refName = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);
                            setRefEntityPropName(refName);
                            checkRefPropNameUniqueness(refName, selectedRefEntity);
                          }
                        }
                      }}
                    >
                      Auto-generate
                    </Button>
                  </div>
                  {/* Show validation message or loading state */}
                  {(refPropNameValidationMessage || isCheckingRefPropName) && (
                    <div className="flex items-center mt-1 text-sm">
                      {isCheckingRefPropName ? (
                        <>
                          <LoaderCircle className="w-3 h-3 mr-1 animate-spin" />
                          <span className="text-muted-foreground">Checking property name availability...</span>
                        </>
                      ) : (
                        <span className={!isRefPropNameValid ? "text-red-500" : "text-muted-foreground"}>
                          {refPropNameValidationMessage}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    This is the property name used in the referenced entity. For example, if this is "customer" entity and you're referencing "orders", this might be "customerOrders".
                  </p>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newProperty.cascadeReference}
                      onCheckedChange={(checked: boolean) =>
                        setNewProperty({ ...newProperty, cascadeReference: checked })
                      }
                    />
                    <UILabel>Cascade Reference</UILabel>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    When enabled, deleting a record will also delete or update referenced records.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Table Properties</h4>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => loadDefaultProperties(name, true)}
                    disabled={isPropertiesLoading}
                  >
                    {isPropertiesLoading ? (
                      <>
                        <FiLoader className="mr-2 h-3 w-3 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FiPlus className="mr-2 h-3 w-3" />
                        Reset Default Properties
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={openAddPropertyModal}
                  >
                    <FiPlus className="mr-2 h-3 w-3" />
                    Add Property
                  </Button>
                  <Badge variant="outline" className="px-2 py-1">
                    {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                  </Badge>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                {isPropertiesLoading ? (
