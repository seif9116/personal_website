## Copy of a Copy of a Copy...
The C++ STL can hide some pretty large complexity under its hood. My favourite example is the copy of a copy of a copy. It is a great illustration of how compilers work.
<hr>

### Bring in the Widget
Say we have a simple `Widget` class. We create a `std::vector` and push two Widgets in by value.

```c++
std::vector<Widget> widgets;

widgets.push_back(Widget(1));
widgets.push_back(Widget(2));
```

A question: How many calls to `Widget`s constructor, destructor and copy constructor are made in this snippet? Well first, the temporary `Widget(1)` is created. Since it is a `rvalue`, it is ephemeral. And since our does not implement a move constructor, the value must be copied into the parameter for `push_back`, from which it is placed in the vector. Afterwords, the temporary `Widget(1)` is immediately destoryed. Great, now statement one is complete. One constructor is called, one copy, one destructor. Lets move on to statement two.

```c++
widgets.push_back(Widget(2));
```
Here we once again create a temporary `Widget(2)`. However, this time
on the call to `push_back` forces a reallocation, since there is no
capacity. The realloc and copy involves: one copy of `Widget(1)`,
one copy of tempoarary `Widget(2)` into the new allocation, a 
destruction of the previous `Widget(1)` at widgets[0].

Now Widget(1) has been copied three times, despite only being create and pushed
into the vector in a single line. If we push back one more time, this is our copy
of a copy of a copy of a Widget.

We can quickly see how this becomes expensive when pushing to a
vector in a loop with trip count n causes several reallcations.

```c++
std::vector<Widget> widgets;

for (int i=0; i<N; i++) {
    widgets.push_back(Widget(i));
}
```

In the worst case we can see this causing `n-1` reallocations.
Thankfully for these widgets, the STL gauarntees the complexity
of `push_back` is an `amortized contstant`. This is typically
achieved by a geometric growth of the reallocation size. For example,
doubling the reallocation size each time.

We can track how many constructors, copies and destructors are called
with the following `Widget` class:

```c++
class Widget {
public:
    
    Widget(int data) : data(data), id(global_id++)
    {
        std::cout << "Constructor\n";
    }
    
    Widget(const &Widget other)
        : data(other.getData()), id(global_id++)
    {
        std::cout << "Copy Constructor\n";
    }
    
    ~Widget() { std::cout << "Destruct: " << id << std::endl; }

    int getData() const { return data; }
}
private:
    static int id;
    int data;
};
```
Before talking about ways to speed this code up, it is important to note
that a `Small Vector Allocation` optimization does exist, where the first
some elements inserted into the vector are stored *within* the vector object
itself, rather than the buffer it points to. This is similar in spirit to
the OS inodes hack for small files.

Nonetheless, there are a couple of ways we can speed up this code from our side of
the compiler. The first and most obvious is the `reserve` method, which will
pre-emptively allocate space in the vector if we expect some number of elements
will be pushed for certain.

What is perhaps interesting however, is how to avoid making so many copies. The poor
`Widget(1)` has had itself cloned enough. There must be a way to take those
bits from the inital stack allocation of `Widget(1)` and re-use or *move*
them to their eventual place. This is the use of a *move-constructor*

```c++
class Widget {
public:
    ...

    // Move constructor
    Widget(Widget&& other) noexcept
        : data(std::exchange(other.data, 0)), 
          id(std::exchange(other.id, -1))
    {
        std::cout << "Move Constructor\n";
    }
 
```





