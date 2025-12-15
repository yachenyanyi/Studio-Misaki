# LangSmith Deployment
**Version:** 0.1.0

## 目录
- [Assistants](#tag-assistants)
- [Threads](#tag-threads)
- [Thread Runs](#tag-thread-runs)
- [Stateless Runs](#tag-stateless-runs)
- [Crons (Plus tier)](#tag-crons-(plus-tier))
- [Store](#tag-store)
- [A2A](#tag-a2a)
- [MCP](#tag-mcp)
- [System](#tag-system)

## <a id='tag-assistants'></a>Assistants
An assistant is a configured instance of a graph.

### Create Assistant
`POST /assistants`

Create an assistant.

An initial version of the assistant will be created and the assistant is set to that version. To change versions, use the `POST /assistants/{assistant_id}/latest` endpoint.

#### Request Body (JSON)
Type: [AssistantCreate](#schema-assistantcreate)

#### Responses
- **200**: Success
  - Return: [Assistant](#schema-assistant)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Search Assistants
`POST /assistants/search`

Search for assistants.

This endpoint also functions as the endpoint to list all assistants.

#### Request Body (JSON)
Type: [AssistantSearchRequest](#schema-assistantsearchrequest)

#### Responses
- **200**: Success
  - Return: Array of [Assistant](#schema-assistant)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Count Assistants
`POST /assistants/count`

Get the count of assistants matching the specified criteria.

#### Request Body (JSON)
Type: [AssistantCountRequest](#schema-assistantcountrequest)

#### Responses
- **200**: Success
  - Return: integer
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Assistant
`GET /assistants/{assistant_id}`

Get an assistant by ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant. |

#### Responses
- **200**: Success
  - Return: [Assistant](#schema-assistant)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Delete Assistant
`DELETE /assistants/{assistant_id}`

Delete an assistant by ID.

All versions of the assistant will be deleted as well.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant. |

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Patch Assistant
`PATCH /assistants/{assistant_id}`

Update an assistant.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant. |

#### Request Body (JSON)
Type: [AssistantPatch](#schema-assistantpatch)

#### Responses
- **200**: Success
  - Return: [Assistant](#schema-assistant)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Assistant Graph
`GET /assistants/{assistant_id}/graph`

Get an assistant by ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | any | **Yes** | The ID of the assistant. |
| xray | query | any | No | Include graph representation of subgraphs. If an integer value is provided, only subgraphs with a depth less than or equal to the value will be included. |

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Assistant Subgraphs
`GET /assistants/{assistant_id}/subgraphs`

Get an assistant's subgraphs.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant. |
| recurse | query | boolean | No | Recursively retrieve subgraphs of subgraphs. |

#### Responses
- **200**: Success
  - Return: [Subgraphs](#schema-subgraphs)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Assistant Subgraphs by Namespace
`GET /assistants/{assistant_id}/subgraphs/{namespace}`

Get an assistant's subgraphs filtered by namespace.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant. |
| namespace | path | string | **Yes** | Namespace of the subgraph to filter by. |
| recurse | query | boolean | No | Recursively retrieve subgraphs of subgraphs. |

#### Responses
- **200**: Success
  - Return: [Subgraphs](#schema-subgraphs)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Assistant Schemas
`GET /assistants/{assistant_id}/schemas`

Get an assistant by ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant. |

#### Responses
- **200**: Success
  - Return: [GraphSchema](#schema-graphschema)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Assistant Versions
`POST /assistants/{assistant_id}/versions`

Get all versions of an assistant.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant. |

#### Responses
- **200**: Success
  - Return: Array of [Assistant](#schema-assistant)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Set Latest Assistant Version
`POST /assistants/{assistant_id}/latest`

Set the latest version for an assistant.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant. |
| version | query | integer | **Yes** | The version to change to. |

#### Responses
- **200**: Success
  - Return: [Assistant](#schema-assistant)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
## <a id='tag-threads'></a>Threads
A thread contains the accumulated outputs of a group of runs.

### Create Thread
`POST /threads`

Create a thread.

#### Request Body (JSON)
Type: [ThreadCreate](#schema-threadcreate)

#### Responses
- **200**: Success
  - Return: [Thread](#schema-thread)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Search Threads
`POST /threads/search`

Search for threads.

This endpoint also functions as the endpoint to list all threads.

#### Request Body (JSON)
Type: [ThreadSearchRequest](#schema-threadsearchrequest)

#### Responses
- **200**: Success
  - Return: Array of [Thread](#schema-thread)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Count Threads
`POST /threads/count`

Get the count of threads matching the specified criteria.

#### Request Body (JSON)
Type: [ThreadCountRequest](#schema-threadcountrequest)

#### Responses
- **200**: Success
  - Return: integer
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Thread State
`GET /threads/{thread_id}/state`

Get state for a thread.

The latest state of the thread (i.e. latest checkpoint) is returned.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| subgraphs | query | boolean | No | Whether to include subgraphs in the response. |

#### Responses
- **200**: Success
  - Return: [ThreadState](#schema-threadstate)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Update Thread State
`POST /threads/{thread_id}/state`

Add state to a thread.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Request Body (JSON)
Type: [ThreadStateUpdate](#schema-threadstateupdate)

#### Responses
- **200**: Success
  - Return: [ThreadStateUpdateResponse](#schema-threadstateupdateresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Thread State At Checkpoint
`GET /threads/{thread_id}/state/{checkpoint_id}`

Get state for a thread at a specific checkpoint.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| checkpoint_id | path | string | **Yes** | The ID of the checkpoint. |
| subgraphs | query | boolean | No | Whether to include subgraphs in the response. |

#### Responses
- **200**: Success
  - Return: [ThreadState](#schema-threadstate)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Thread State At Checkpoint
`POST /threads/{thread_id}/state/checkpoint`

Get state for a thread at a specific checkpoint.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| subgraphs | query | boolean | No |  |

#### Request Body (JSON)
Type: [ThreadStateCheckpointRequest](#schema-threadstatecheckpointrequest)

#### Responses
- **200**: Success
  - Return: [ThreadState](#schema-threadstate)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Thread History
`GET /threads/{thread_id}/history`

Get all past states for a thread.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| limit | query | integer | No |  |
| before | query | string | No |  |

#### Responses
- **200**: Success
  - Return: Array of [ThreadState](#schema-threadstate)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Thread History Post
`POST /threads/{thread_id}/history`

Get all past states for a thread.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Request Body (JSON)
Type: [ThreadStateSearch](#schema-threadstatesearch)

#### Responses
- **200**: Success
  - Return: Array of [ThreadState](#schema-threadstate)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Copy Thread
`POST /threads/{thread_id}/copy`

Create a new thread with a copy of the state and checkpoints from an existing thread.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Responses
- **200**: Success
  - Return: [Thread](#schema-thread)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Thread
`GET /threads/{thread_id}`

Get a thread by ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Responses
- **200**: Success
  - Return: [Thread](#schema-thread)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Delete Thread
`DELETE /threads/{thread_id}`

Delete a thread by ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Patch Thread
`PATCH /threads/{thread_id}`

Update a thread.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Request Body (JSON)
Type: [ThreadPatch](#schema-threadpatch)

#### Responses
- **200**: Success
  - Return: [Thread](#schema-thread)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Join Thread Stream
`GET /threads/{thread_id}/stream`

This endpoint streams output in real-time from a thread. The stream will include the output of each run executed sequentially on the thread and will remain open indefinitely. It is the responsibility of the calling client to close the connection.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| Last-Event-ID | header | string | No |  |
| stream_modes | query | any | No |  |

#### Responses
- **200**: Success
  - Return: Event Stream
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
## <a id='tag-thread-runs'></a>Thread Runs
A run is an invocation of a graph / assistant on a thread. It updates the state of the thread.

### List Runs
`GET /threads/{thread_id}/runs`

List runs for a thread.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| limit | query | integer | No |  |
| offset | query | integer | No |  |
| status | query | string | No |  |
| select | query | array | No |  |

#### Responses
- **200**: Success
  - Return: Array of [Run](#schema-run)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Create Background Run
`POST /threads/{thread_id}/runs`

Create a run in existing thread, return the run ID immediately. Don't wait for the final run output.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Request Body (JSON)
Type: [RunCreateStateful](#schema-runcreatestateful)

#### Responses
- **200**: Success
  - Return: [Run](#schema-run)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Create Run, Stream Output
`POST /threads/{thread_id}/runs/stream`

Create a run in existing thread. Stream the output.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Request Body (JSON)
Type: [RunCreateStateful](#schema-runcreatestateful)

#### Responses
- **200**: Success
  - Return: Event Stream
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Create Run, Wait for Output
`POST /threads/{thread_id}/runs/wait`

Create a run in existing thread. Wait for the final output and then return it.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Request Body (JSON)
Type: [RunCreateStateful](#schema-runcreatestateful)

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Get Run
`GET /threads/{thread_id}/runs/{run_id}`

Get a run by ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| run_id | path | string | **Yes** | The ID of the run. |

#### Responses
- **200**: Success
  - Return: [Run](#schema-run)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Delete Run
`DELETE /threads/{thread_id}/runs/{run_id}`

Delete a run by ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| run_id | path | string | **Yes** | The ID of the run. |

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Join Run
`GET /threads/{thread_id}/runs/{run_id}/join`

Wait for a run to finish.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| run_id | path | string | **Yes** | The ID of the run. |
| cancel_on_disconnect | query | boolean | No |  |

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Join Run Stream
`GET /threads/{thread_id}/runs/{run_id}/stream`

Join a run stream. This endpoint streams output in real-time from a run similar to the /threads/__THREAD_ID__/runs/stream endpoint. If the run has been created with `stream_resumable=true`, the stream can be resumed from the last seen event ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| run_id | path | string | **Yes** | The ID of the run. |
| Last-Event-ID | header | string | No |  |
| stream_mode | query | string | No |  |
| cancel_on_disconnect | query | boolean | No |  |

#### Responses
- **200**: Success
  - Return: Event Stream
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Cancel Run
`POST /threads/{thread_id}/runs/{run_id}/cancel`

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |
| run_id | path | string | **Yes** | The ID of the run. |
| wait | query | boolean | No |  |
| action | query | string | No | Action to take when cancelling the run. Possible values are `interrupt` or `rollback`. `interrupt` will simply cancel the run. `rollback` will cancel the run and delete the run and associated checkpoints afterwards. |

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Cancel Runs
`POST /runs/cancel`

Cancel one or more runs. Can cancel runs by thread ID and run IDs, or by status filter.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| action | query | string | No | Action to take when cancelling the run. Possible values are `interrupt` or `rollback`. `interrupt` will simply cancel the run. `rollback` will cancel the run and delete the run and associated checkpoints afterwards. |

#### Request Body (JSON)
Type: [RunsCancel](#schema-runscancel)

#### Responses
- **204**: Success - Runs cancelled
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
## <a id='tag-stateless-runs'></a>Stateless Runs
A run is an invocation of a graph / assistant, with no state or memory persistence.

### Create Run, Stream Output
`POST /runs/stream`

Create a run and stream the output.

#### Request Body (JSON)
Type: [RunCreateStateless](#schema-runcreatestateless)

#### Responses
- **200**: Success
  - Return: Event Stream
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Create Run, Wait for Output
`POST /runs/wait`

Create a run, wait for the final output and then return it.

#### Request Body (JSON)
Type: [RunCreateStateless](#schema-runcreatestateless)

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Create Background Run
`POST /runs`

Create a run and return the run ID immediately. Don't wait for the final run output.

#### Request Body (JSON)
Type: [RunCreateStateless](#schema-runcreatestateless)

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Create Run Batch
`POST /runs/batch`

Create a batch of runs and return immediately.

#### Request Body (JSON)
Type: [RunBatchCreate](#schema-runbatchcreate)

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **409**: Conflict
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
## <a id='tag-crons-(plus-tier)'></a>Crons (Plus tier)
A cron is a periodic run that recurs on a given schedule. The repeats can be isolated, or share state in a thread

### Create Thread Cron
`POST /threads/{thread_id}/runs/crons`

Create a cron to schedule runs on a thread.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| thread_id | path | string | **Yes** | The ID of the thread. |

#### Request Body (JSON)
Type: [ThreadCronCreate](#schema-threadcroncreate)

#### Responses
- **200**: Success
  - Return: [Cron](#schema-cron)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Create Cron
`POST /runs/crons`

Create a cron to schedule runs on new threads.

#### Request Body (JSON)
Type: [CronCreate](#schema-croncreate)

#### Responses
- **200**: Success
  - Return: [Cron](#schema-cron)
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Search Crons
`POST /runs/crons/search`

Search all active crons

#### Request Body (JSON)
Type: [CronSearch](#schema-cronsearch)

#### Responses
- **200**: Success
  - Return: Array of [Cron](#schema-cron)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Count Crons
`POST /runs/crons/count`

Get the count of crons matching the specified criteria.

#### Request Body (JSON)
Type: [CronCountRequest](#schema-croncountrequest)

#### Responses
- **200**: Success
  - Return: integer
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Delete Cron
`DELETE /runs/crons/{cron_id}`

Delete a cron by ID.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| cron_id | path | string | **Yes** |  |

#### Responses
- **200**: Success
  - Return: Object
- **404**: Not Found
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
## <a id='tag-store'></a>Store
Store is an API for managing persistent key-value store (long-term memory) that is available from any thread.

### Store or update an item.
`PUT /store/items`

#### Request Body (JSON)
Type: [StorePutRequest](#schema-storeputrequest)

#### Responses
- **204**: Success
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Delete an item.
`DELETE /store/items`

#### Request Body (JSON)
Type: [StoreDeleteRequest](#schema-storedeleterequest)

#### Responses
- **204**: Success
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Retrieve a single item.
`GET /store/items`

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| key | query | string | **Yes** |  |
| namespace | query | array | No |  |

#### Responses
- **200**: Success
  - Return: [Item](#schema-item)
- **400**: Bad Request
  - Return: [ErrorResponse](#schema-errorresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### Search for items within a namespace prefix.
`POST /store/items/search`

#### Request Body (JSON)
Type: [StoreSearchRequest](#schema-storesearchrequest)

#### Responses
- **200**: Success
  - Return: [SearchItemsResponse](#schema-searchitemsresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
### List namespaces with optional match conditions.
`POST /store/namespaces`

#### Request Body (JSON)
Type: [StoreListNamespacesRequest](#schema-storelistnamespacesrequest)

#### Responses
- **200**: Success
  - Return: [ListNamespaceResponse](#schema-listnamespaceresponse)
- **422**: Validation Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
## <a id='tag-a2a'></a>A2A
Agent-to-Agent Protocol related endpoints for exposing assistants as A2A-compliant agents.

### A2A Post
`POST /a2a/{assistant_id}`

Communicate with an assistant using the Agent-to-Agent Protocol.
Sends a JSON-RPC 2.0 message to the assistant.

- **Request**: Provide an object with `jsonrpc`, `id`, `method`, and optional `params`.
- **Response**: Returns a JSON-RPC response with task information or error.

**Supported Methods:**
- `message/send`: Send a message to the assistant
- `tasks/get`: Get the status and result of a task

**Notes:**
- Supports threaded conversations via thread context
- Messages can contain text and data parts
- Tasks run asynchronously and return completion status


#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| assistant_id | path | string | **Yes** | The ID of the assistant to communicate with |
| Accept | header | string | **Yes** | Must be application/json |

#### Request Body (JSON)
Type: 
- **jsonrpc**: string  - JSON-RPC version
- **id**: string  - Request identifier
- **method**: string  - The method to invoke
- **params**: Object  - Method parameters

#### Responses
- **200**: JSON-RPC response
  - Return: 
  - **jsonrpc**: string 
  - **id**: string 
  - **result**: Object  - Success result containing task information or task details
  - **error**: 
- **code**: integer 
- **message**: string   - Error information if request failed
- **400**: Bad request - invalid JSON-RPC or missing Accept header
- **404**: Assistant not found
- **500**: Internal server error

---
## <a id='tag-mcp'></a>MCP
Model Context Protocol related endpoints for exposing an agent as an MCP server.

### MCP Post
`POST /mcp/`

Implemented according to the Streamable HTTP Transport specification.
Sends a JSON-RPC 2.0 message to the server.

- **Request**: Provide an object with `jsonrpc`, `id`, `method`, and optional `params`.
- **Response**: Returns a JSON-RPC response or acknowledgment.

**Notes:**
- Stateless: Sessions are not persisted across requests.


#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| Accept | header | string | **Yes** | Accept header must include both 'application/json' and 'text/event-stream' media types. |

#### Request Body (JSON)
Type: Object

#### Responses
- **200**: Successful JSON-RPC response.
  - Return: Object
- **202**: Notification or response accepted; no content body.
- **400**: Bad request: invalid JSON or message format, or unacceptable Accept header.
- **405**: HTTP method not allowed.
- **500**: Internal server error or unexpected failure.

---
### MCP Get
`GET /mcp/`

Implemented according to the Streamable HTTP Transport specification.

#### Responses
- **405**: GET method not allowed; streaming not supported.

---
### Terminate Session
`DELETE /mcp/`

Implemented according to the Streamable HTTP Transport specification.
Terminate an MCP session. The server implementation is stateless, so this is a no-op.



#### Responses
- **404**: Session not found

---
## <a id='tag-system'></a>System
System endpoints for health checks, metrics, and server information.

### Server Information
`GET /info`

Get server version information, feature flags, and metadata.

#### Responses
- **200**: Success
  - Return: 
  - **version**: string  - LangGraph API version
  - **langgraph_py_version**: string  - LangGraph Python library version
  - **flags**: Object  - Enabled features and capabilities
  - **metadata**: Object  - Server deployment metadata

---
### System Metrics
`GET /metrics`

Get system metrics in Prometheus or JSON format for monitoring and observability.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| format | query | string | No |  |

#### Responses
- **200**: Success
  - Return: Object

---
### Health Check
`GET /ok`

Check the health status of the server. Optionally check database connectivity.

#### Parameters
| Name | In | Type | Required | Description |
|---|---|---|---|---|
| check_db | query | integer | No |  |

#### Responses
- **200**: Success
  - Return: 
  - **ok**: boolean  - Indicates the server is healthy
- **500**: Internal Server Error
  - Return: [ErrorResponse](#schema-errorresponse)

---
## Schemas
### <a id='schema-assistant'></a>Assistant
| Property | Type | Description |
|---|---|---|
| assistant_id | string | The ID of the assistant. |
| graph_id | string | The ID of the graph. |
| config | object | The assistant config. |
| context | object | Static context added to the assistant. |
| created_at | string | The time the assistant was created. |
| updated_at | string | The last time the assistant was updated. |
| metadata | object | The assistant metadata. |
| version | integer | The version of the assistant |
| name | string | The name of the assistant |
| description | ['string', 'null'] | The description of the assistant |

### <a id='schema-assistantcreate'></a>AssistantCreate
Payload for creating an assistant.

| Property | Type | Description |
|---|---|---|
| assistant_id | string | The ID of the assistant. If not provided, a random UUID will be generated. |
| graph_id | string | The ID of the graph the assistant should use. The graph ID is normally set in your langgraph.json configuration. |
| config | object | Configuration to use for the graph. Useful when graph is configurable and you want to create different assistants based on different configurations. |
| context | object | Static context added to the assistant. |
| metadata | object | Metadata to add to assistant. |
| if_exists | string | How to handle duplicate creation. Must be either 'raise' (raise error if duplicate), or 'do_nothing' (return existing assistant). |
| name | string | The name of the assistant. Defaults to 'Untitled'. |
| description | ['string', 'null'] | The description of the assistant. Defaults to null. |

### <a id='schema-assistantpatch'></a>AssistantPatch
Payload for updating an assistant.

| Property | Type | Description |
|---|---|---|
| graph_id | string | The ID of the graph the assistant should use. The graph ID is normally set in your langgraph.json configuration. If not provided, assistant will keep pointing to same graph. |
| config | object | Configuration to use for the graph. Useful when graph is configurable and you want to update the assistant's configuration. |
| context | object | Static context added to the assistant. |
| metadata | object | Metadata to merge with existing assistant metadata. |
| name | string | The new name for the assistant. If not provided, assistant will keep its current name. |
| description | string | The new description for the assistant. If not provided, assistant will keep its current description. |

### <a id='schema-assistantversionchange'></a>AssistantVersionChange
Payload for changing the version of an assistant.

| Property | Type | Description |
|---|---|---|
| version | integer | The assistant version. |

### <a id='schema-config'></a>Config
| Property | Type | Description |
|---|---|---|
| tags | array |  |
| recursion_limit | integer |  |
| configurable | object |  |

### <a id='schema-cron'></a>Cron
Represents a scheduled task.

| Property | Type | Description |
|---|---|---|
| cron_id | string | The ID of the cron. |
| assistant_id | ['string', 'null'] | The ID of the assistant. |
| thread_id | string | The ID of the thread. |
| end_time | string | The end date to stop running the cron. |
| schedule | string | The schedule to run, cron format. |
| created_at | string | The time the cron was created. |
| updated_at | string | The last time the cron was updated. |
| user_id | ['string', 'null'] | The ID of the user. |
| payload | object | The run payload to use for creating new run. |
| next_run_date | ['string', 'null'] | The next run date of the cron. |
| metadata | object | The cron metadata. |

### <a id='schema-croncreate'></a>CronCreate
Payload for creating a stateless cron job (creates a new thread for each execution).

| Property | Type | Description |
|---|---|---|
| schedule | string | The cron schedule to execute this job on. |
| end_time | string | The end date to stop running the cron. |
| assistant_id | string or string | The assistant ID or graph name to run. If using graph name, will default to the assistant automatically created from that graph by the server. |
| input | array or object | The input to the graph. |
| metadata | object | Metadata to assign to the cron job runs. |
| config | object | The configuration for the assistant. |
| context | object | Static context added to the assistant. |
| webhook | string | Webhook to call after LangGraph API call is done. |
| interrupt_before | string or array | Nodes to interrupt immediately before they get executed. |
| interrupt_after | string or array | Nodes to interrupt immediately after they get executed. |
| on_run_completed | string | What to do with the thread after the run completes. 'delete' removes the thread after execution. 'keep' creates a new thread for each execution but does not clean them up. |

### <a id='schema-cronsearch'></a>CronSearch
Payload for listing crons

| Property | Type | Description |
|---|---|---|
| assistant_id | string | The assistant ID or graph name to filter by using exact match. |
| thread_id | string | The thread ID to search for. |
| limit | integer | The maximum number of results to return. |
| offset | integer | The number of results to skip. |
| sort_by | string | The field to sort by. |
| sort_order | string | The order to sort by. |
| select | array | Specify which fields to return. If not provided, all fields are returned. |

### <a id='schema-croncountrequest'></a>CronCountRequest
Payload for counting crons

| Property | Type | Description |
|---|---|---|
| assistant_id | string | The assistant ID or graph name to search for. |
| thread_id | string | The thread ID to search for. |

### <a id='schema-graphschema'></a>GraphSchema
Defines the structure and properties of a graph.

| Property | Type | Description |
|---|---|---|
| graph_id | string | The ID of the graph. |
| input_schema | object | The schema for the graph input. Missing if unable to generate JSON schema from graph. |
| output_schema | object | The schema for the graph output. Missing if unable to generate JSON schema from graph. |
| state_schema | object | The schema for the graph state. Missing if unable to generate JSON schema from graph. |
| config_schema | object | The schema for the graph config. Missing if unable to generate JSON schema from graph. |
| context_schema | object | The schema for the graph context. Missing if unable to generate JSON schema from graph. |

### <a id='schema-graphschemanoid'></a>GraphSchemaNoId
Defines the structure and properties of a graph without an ID.

| Property | Type | Description |
|---|---|---|
| input_schema | object | The schema for the graph input. Missing if unable to generate JSON schema from graph. |
| output_schema | object | The schema for the graph output. Missing if unable to generate JSON schema from graph. |
| state_schema | object | The schema for the graph state. Missing if unable to generate JSON schema from graph. |
| config_schema | object | The schema for the graph config. Missing if unable to generate JSON schema from graph. |
| context_schema | object | The schema for the graph context. Missing if unable to generate JSON schema from graph. |

### <a id='schema-subgraphs'></a>Subgraphs
Map of graph name to graph schema metadata (`input_schema`, `output_schema`, `state_schema`, `config_schema`, `context_schema`).


### <a id='schema-run'></a>Run
| Property | Type | Description |
|---|---|---|
| run_id | string | The ID of the run. |
| thread_id | string | The ID of the thread. |
| assistant_id | string | The assistant that was used for this run. |
| created_at | string | The time the run was created. |
| updated_at | string | The last time the run was updated. |
| status | string | The status of the run. One of 'pending', 'running', 'error', 'success', 'timeout', 'interrupted'. |
| metadata | object | The run metadata. |
| kwargs | object |  |
| multitask_strategy | string | Strategy to handle concurrent runs on the same thread. |

### <a id='schema-send'></a>Send
A message to send to a node.

| Property | Type | Description |
|---|---|---|
| node | string | The node to send the message to. |
| input | ['object', 'array', 'number', 'string', 'boolean', 'null'] | The message to send. |

### <a id='schema-command'></a>Command
The command to run.

| Property | Type | Description |
|---|---|---|
| update | ['object', 'array', 'null'] | An update to the state. |
| resume | ['object', 'array', 'number', 'string', 'boolean', 'null'] | A value to pass to an interrupted node. |
| goto | Send or array or string or array or null | Name of the node(s) to navigate to next or node(s) to be executed with a provided input. |

### <a id='schema-runcreatestateful'></a>RunCreateStateful
Payload for creating a run.

| Property | Type | Description |
|---|---|---|
| assistant_id | string or string | The assistant ID or graph name to run. If using graph name, will default to first assistant created from that graph. |
| checkpoint | [CheckpointConfig](#schema-checkpointconfig) | The checkpoint to resume from. |
| input | object or array or string or number or boolean or null | The input to the graph. |
| command | Command or null | The input to the graph. |
| metadata | object | Metadata to assign to the run. |
| config | object | The configuration for the assistant. |
| context | object | Static context added to the assistant. |
| webhook | string | Webhook to call after LangGraph API call is done. |
| interrupt_before | string or array | Nodes to interrupt immediately before they get executed. |
| interrupt_after | string or array | Nodes to interrupt immediately after they get executed. |
| stream_mode | array or string | The stream mode(s) to use. |
| stream_subgraphs | boolean | Whether to stream output from subgraphs. |
| stream_resumable | boolean | Whether to persist the stream chunks in order to resume the stream later. |
| on_disconnect | string | The disconnect mode to use. Must be one of 'cancel' or 'continue'. |
| feedback_keys | array | Feedback keys to assign to run. |
| multitask_strategy | string | Multitask strategy to use. Must be one of 'reject', 'interrupt', 'rollback', or 'enqueue'. |
| if_not_exists | string | How to handle missing thread. Must be either 'reject' (raise error if missing), or 'create' (create new thread). |
| after_seconds | number | The number of seconds to wait before starting the run. Use to schedule future runs. |
| checkpoint_during | boolean | Whether to checkpoint during the run. |
| durability | string | Durability level for the run. Must be one of 'sync', 'async', or 'exit'. |

### <a id='schema-runbatchcreate'></a>RunBatchCreate
Payload for creating a batch of runs.


### <a id='schema-runcreatestateless'></a>RunCreateStateless
Payload for creating a run.

| Property | Type | Description |
|---|---|---|
| assistant_id | string or string | The assistant ID or graph name to run. If using graph name, will default to first assistant created from that graph. |
| input | object or array or string or number or boolean or null | The input to the graph. |
| command | Command or null | The input to the graph. |
| metadata | object | Metadata to assign to the run. |
| config | object | The configuration for the assistant. |
| context | object | Static context added to the assistant. |
| webhook | string | Webhook to call after LangGraph API call is done. |
| stream_mode | array or string | The stream mode(s) to use. |
| feedback_keys | array | Feedback keys to assign to run. |
| stream_subgraphs | boolean | Whether to stream output from subgraphs. |
| stream_resumable | boolean | Whether to persist the stream chunks in order to resume the stream later. |
| on_completion | string | Whether to delete or keep the thread created for a stateless run. Must be one of 'delete' or 'keep'. |
| on_disconnect | string | The disconnect mode to use. Must be one of 'cancel' or 'continue'. |
| after_seconds | number | The number of seconds to wait before starting the run. Use to schedule future runs. |
| checkpoint_during | boolean | Whether to checkpoint during the run. |
| durability | string | Durability level for the run. Must be one of 'sync', 'async', or 'exit'. |

### <a id='schema-assistantsearchrequest'></a>AssistantSearchRequest
Payload for listing assistants.

| Property | Type | Description |
|---|---|---|
| metadata | object | Metadata to filter by. Exact match filter for each KV pair. |
| graph_id | string | The ID of the graph to filter by. The graph ID is normally set in your langgraph.json configuration. |
| name | string | Name of the assistant to filter by. The filtering logic will match (case insensitive) assistants where 'name' is a substring of the assistant name. |
| limit | integer | The maximum number of results to return. |
| offset | integer | The number of results to skip. |
| sort_by | string | The field to sort by. |
| sort_order | string | The order to sort by. |
| select | array | Specify which fields to return. If not provided, all fields are returned. |

### <a id='schema-assistantcountrequest'></a>AssistantCountRequest
Payload for counting assistants.

| Property | Type | Description |
|---|---|---|
| metadata | object | Metadata to filter by. Exact match filter for each KV pair. |
| graph_id | string | The ID of the graph to filter by. The graph ID is normally set in your langgraph.json configuration. |
| name | string | Name of the assistant to filter by. The filtering logic will match (case insensitive) assistants where 'name' is a substring of the assistant name. |

### <a id='schema-assistantversionssearchrequest'></a>AssistantVersionsSearchRequest
Payload for listing assistant versions.

| Property | Type | Description |
|---|---|---|
| metadata | object | Metadata to filter versions by. Exact match filter for each KV pair. |
| limit | integer | The maximum number of versions to return. |
| offset | integer | The number of versions to skip. |

### <a id='schema-threadsearchrequest'></a>ThreadSearchRequest
Payload for listing threads.

| Property | Type | Description |
|---|---|---|
| ids | array | List of thread IDs to include. Others are excluded. |
| metadata | object | Thread metadata to filter on. |
| values | object | State values to filter on. |
| status | string | Thread status to filter on. |
| limit | integer | Maximum number to return. |
| offset | integer | Offset to start from. |
| sort_by | string | Sort by field. |
| sort_order | string | Sort order. |
| select | array | Specify which fields to return. If not provided, all fields are returned. |

### <a id='schema-threadcountrequest'></a>ThreadCountRequest
Payload for counting threads.

| Property | Type | Description |
|---|---|---|
| metadata | object | Thread metadata to filter on. |
| values | object | State values to filter on. |
| status | string | Thread status to filter on. |

### <a id='schema-thread'></a>Thread
| Property | Type | Description |
|---|---|---|
| thread_id | string | The ID of the thread. |
| created_at | string | The time the thread was created. |
| updated_at | string | The last time the thread was updated. |
| metadata | object | The thread metadata. |
| config | object | The thread config. |
| status | string | The status of the thread. |
| values | object | The current state of the thread. |
| interrupts | object | The current interrupts of the thread. |

### <a id='schema-threadcreate'></a>ThreadCreate
Payload for creating a thread.

| Property | Type | Description |
|---|---|---|
| thread_id | string | The ID of the thread. If not provided, a random UUID will be generated. |
| metadata | object | Metadata to add to thread. |
| if_exists | string | How to handle duplicate creation. Must be either 'raise' (raise error if duplicate), or 'do_nothing' (return existing thread). |
| ttl | object | The time-to-live for the thread. |
| supersteps | array |  |

### <a id='schema-threadpatch'></a>ThreadPatch
Payload for updating a thread.

| Property | Type | Description |
|---|---|---|
| metadata | object | Metadata to merge with existing thread metadata. |
| ttl | object | The time-to-live for the thread. |

### <a id='schema-threadstatecheckpointrequest'></a>ThreadStateCheckpointRequest
Payload for getting the state of a thread at a checkpoint.

| Property | Type | Description |
|---|---|---|
| checkpoint | [CheckpointConfig](#schema-checkpointconfig) | The checkpoint to get the state for. |
| subgraphs | boolean | Include subgraph states. |

### <a id='schema-threadstate'></a>ThreadState
| Property | Type | Description |
|---|---|---|
| values | array or object |  |
| next | array |  |
| tasks | array |  |
| checkpoint | [CheckpointConfig](#schema-checkpointconfig) |  |
| metadata | object |  |
| created_at | string |  |
| parent_checkpoint | object |  |
| interrupts | array |  |

### <a id='schema-threadstatesearch'></a>ThreadStateSearch
| Property | Type | Description |
|---|---|---|
| limit | integer | The maximum number of states to return. |
| before | [CheckpointConfig](#schema-checkpointconfig) | Return states before this checkpoint. |
| metadata | object | Filter states by metadata key-value pairs. |
| checkpoint | [CheckpointConfig](#schema-checkpointconfig) | Return states for this subgraph. |

### <a id='schema-threadstateupdate'></a>ThreadStateUpdate
Payload for updating the state of a thread.

| Property | Type | Description |
|---|---|---|
| values | array or object or null | The values to update the state with. |
| checkpoint | [CheckpointConfig](#schema-checkpointconfig) | The checkpoint to update the state of. |
| as_node | string | Update the state as if this node had just executed. |

### <a id='schema-threadsuperstepupdate'></a>ThreadSuperstepUpdate
| Property | Type | Description |
|---|---|---|
| values | array or object or null |  |
| command | Command or null | The command associated with the update. |
| as_node | string | Update the state as if this node had just executed. |

### <a id='schema-threadstateupdateresponse'></a>ThreadStateUpdateResponse
Response for adding state to a thread.

| Property | Type | Description |
|---|---|---|
| checkpoint | object |  |

### <a id='schema-checkpointconfig'></a>CheckpointConfig
Checkpoint config.

| Property | Type | Description |
|---|---|---|
| thread_id | string | Unique identifier for the thread associated with this checkpoint. |
| checkpoint_ns | string | Namespace for the checkpoint, used for organization and retrieval. |
| checkpoint_id | string | Optional unique identifier for the checkpoint itself. |
| checkpoint_map | object | Optional dictionary containing checkpoint-specific data. |

### <a id='schema-storeputrequest'></a>StorePutRequest
Request to store or update an item.

| Property | Type | Description |
|---|---|---|
| namespace | array | A list of strings representing the namespace path. |
| key | string | The unique identifier for the item within the namespace. |
| value | object | A dictionary containing the item's data. |

### <a id='schema-storedeleterequest'></a>StoreDeleteRequest
Request to delete an item.

| Property | Type | Description |
|---|---|---|
| namespace | array | A list of strings representing the namespace path. |
| key | string | The unique identifier for the item. |

### <a id='schema-storesearchrequest'></a>StoreSearchRequest
Request to search for items within a namespace prefix.

| Property | Type | Description |
|---|---|---|
| namespace_prefix | ['array', 'null'] | List of strings representing the namespace prefix. |
| filter | ['object', 'null'] | Optional dictionary of key-value pairs to filter results. |
| limit | integer | Maximum number of items to return (default is 10). |
| offset | integer | Number of items to skip before returning results (default is 0). |
| query | ['string', 'null'] | Query string for semantic/vector search. |

### <a id='schema-storelistnamespacesrequest'></a>StoreListNamespacesRequest
| Property | Type | Description |
|---|---|---|
| prefix | array | Optional list of strings representing the prefix to filter namespaces. |
| suffix | array | Optional list of strings representing the suffix to filter namespaces. |
| max_depth | integer | Optional integer specifying the maximum depth of namespaces to return. |
| limit | integer | Maximum number of namespaces to return (default is 100). |
| offset | integer | Number of namespaces to skip before returning results (default is 0). |

### <a id='schema-item'></a>Item
Represents a single document or data entry in the graph's Store. Items are used to store cross-thread memories.

| Property | Type | Description |
|---|---|---|
| namespace | array | The namespace of the item. A namespace is analogous to a document's directory. |
| key | string | The unique identifier of the item within its namespace. In general, keys needn't be globally unique. |
| value | object | The value stored in the item. This is the document itself. |
| created_at | string | The timestamp when the item was created. |
| updated_at | string | The timestamp when the item was last updated. |

### <a id='schema-runscancel'></a>RunsCancel
Payload for cancelling runs.

| Property | Type | Description |
|---|---|---|
| status | string | Filter runs by status to cancel. Must be one of 'pending', 'running', or 'all'. |
| thread_id | string | The ID of the thread containing runs to cancel. |
| run_ids | array | List of run IDs to cancel. |

### <a id='schema-searchitemsresponse'></a>SearchItemsResponse
| Property | Type | Description |
|---|---|---|
| items | array |  |

### <a id='schema-listnamespaceresponse'></a>ListNamespaceResponse

### <a id='schema-errorresponse'></a>ErrorResponse
Error message returned from the server


### <a id='schema-threadcroncreate'></a>ThreadCronCreate
Payload for creating a thread-specific cron job (runs on the same thread).

| Property | Type | Description |
|---|---|---|
| schedule | string | The cron schedule to execute this job on. |
| end_time | string | The end date to stop running the cron. |
| assistant_id | string or string | The assistant ID or graph name to run. If using graph name, will default to the assistant automatically created from that graph by the server. |
| input | array or object | The input to the graph. |
| metadata | object | Metadata to assign to the cron job runs. |
| config | object | The configuration for the assistant. |
| context | object | Static context added to the assistant. |
| webhook | string | Webhook to call after LangGraph API call is done. |
| interrupt_before | string or array | Nodes to interrupt immediately before they get executed. |
| interrupt_after | string or array | Nodes to interrupt immediately after they get executed. |
| multitask_strategy | string | Multitask strategy to use. Must be one of 'reject', 'interrupt', 'rollback', or 'enqueue'. |

### <a id='schema-interrupt'></a>Interrupt
| Property | Type | Description |
|---|---|---|
| id | ['string', 'null'] |  |
| value | object |  |
