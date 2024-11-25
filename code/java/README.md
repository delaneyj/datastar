---

# Datastar Java SDK

This SDK provides tools for interacting with [Datastar](https://data-star.dev/). It enables Java developers to efficiently work with Datastar features like Server-Sent Events (SSE), managing DOM fragments, signals, and executing browser-side scripts.

---

## License

This package is licensed under the [MIT License](LICENSE).

---

## Requirements

- Java 17 or later
- Maven or Gradle build system

---

## Installation

To use this SDK in your project, you need to include the GitHub Packages Maven repository and add the SDK as a dependency.

### **Maven**

Add the following repository and dependency to your `pom.xml`:

```xml
<repositories>
    <repository>
        <id>github</id>
        <url>https://maven.pkg.github.com/starfederation/datastar</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>StarFederation.Datastar</groupId>
        <artifactId>datastar-java</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

### **Gradle**

For Gradle, add the repository and dependency in your `build.gradle` file:

```gradle
repositories {
    maven {
        url = uri("https://maven.pkg.github.com/starfederation/datastar")
        credentials {
            username = "your-github-username"
            password = "your-personal-access-token"
        }
    }
}

dependencies {
    implementation 'StarFederation.Datastar:datastar-java:1.0.0'
}
```

---

## Usage

### **Server-Sent Events (SSE) Example**

The following example demonstrates how to use `ServerSentEventGenerator` to interact with the client browser:

```java
import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.events.mergefragments.MergeFragmentsOptions;

ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

// Merging fragments into the DOM
sse.MergeFragments("<div>Hello, World!</div>", MergeFragmentsOptions.create()
    .withSelector("#my-div")
    .withMergeMode(FragmentMergeMode.APPEND)
    .withSettleDuration(500)
    .withUseViewTransition(true)
);

// Removing fragments from the DOM
sse.RemoveFragments("#my-div");

// Sending signals to the store
sse.MergeSignals("{foo: 'bar'}", MergeSignalsOptions.create()
    .withOnlyIfMissing(true)
);

// Removing signals from the store
sse.RemoveSignals(List.of("foo", "baz"));

// Executing JavaScript in the browser
sse.ExecuteScript("console.log('Hello, Datastar!')");
```

### **Read Signals Example**

The `SignalReader` helps parse incoming signals from a client request:

```java
import StarFederation.Datastar.events.SignalReader;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

HttpServletRequest request = ...; // Obtain this from your servlet or framework
Map<String, Object> store = new HashMap<>();

SignalReader.readSignals(request, store);
System.out.println("Parsed Signals: " + store);
```

### **DataStore Example**

The `DataStore` class provides utilities for managing key-value pairs in memory:

```java
import StarFederation.Datastar.events.DataStore;

DataStore store = new DataStore();
store.put("key", "value");
System.out.println(store.get("key", String.class)); // Output: value

String json = store.toJson();
System.out.println("Serialized Store: " + json);

store.fromJson("{\"newKey\":\"newValue\"}");
System.out.println(store.get("newKey", String.class)); // Output: newValue
```

---

## Example Application

To see the SDK in action, clone the repository and navigate to the `examples/` module:

```bash
git clone https://github.com/starfederation/datastar.git
cd datastar/examples
mvn clean install
```

Run the example application:

```bash
java -jar target/examples-1.0.0.jar
```

---

## Contributing

We welcome contributions to improve the SDK. To contribute:
1. Fork this repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a clear description of your changes.

---

## Reporting Issues

If you encounter any issues or have feature requests, please [open an issue](https://github.com/starfederation/datastar/issues).

---

## Changelog

### **v1.0.0**
- Initial release of the Datastar Java SDK.
- Support for:
    - Server-Sent Events (SSE)
    - Managing DOM fragments
    - Managing signals
    - Executing browser-side JavaScript

---

## Credits

This SDK was developed by the Star Federation team.

---