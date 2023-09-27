#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import Generic, TypeVar, TypeAlias, List
from typing_extensions import Self

from pydantic import BaseModel

GenType: TypeAlias = TypeVar("GenType", bound=BaseModel)


def cmp(a, b):
    return (a > b) - (a < b)


class Sllistnode(object):
    __slots__ = ('__next', 'value', '__list')

    def __init__(self, value=None, next=None, list=None):
        self.__next = next
        self.value = value
        self.__list = list

    @property
    def next(self) -> Self:
        return self.__next

    @property
    def list(self) -> List[Self]:
        return self.__list

    def iternext(self, to=None):
        if to is not None:
            if not isinstance(to, Sllistnode):
                raise TypeError('to argument must be a sllistnode')
            if to.list is not self.__list:
                raise ValueError('to argument belongs to another list')

        current = self
        while current is not None and current != to:
            yield current
            current = current.__next

    def __call__(self):
        return self.value

    def __str__(self):
        return "sllistnode(%s)" % str(self.value)

    def __repr__(self):
        return "<sllistnode(%s)>" % repr(self.value)


class sllist(object):
    __slots__ = ('__first', '__last', '__size',)

    def __init__(self, iterable=None):
        self.__first = None
        self.__last = None
        self.__size = 0
        if iterable:
            self.__extend(iterable)

    @property
    def first(self) -> Sllistnode:
        return self.__first

    @property
    def last(self) -> Sllistnode:
        return self.__last

    @property
    def size(self) -> int:
        return self.__size

    def nodeat(self, index):
        if not isinstance(index, int):
            raise TypeError('invalid index type')

        if index < 0:
            index = self.__size + index

        if index < 0 or index >= self.__size:
            raise IndexError('index out of range')

        if not self.__first:
            raise IndexError("index out of range")

        curr = self.__first
        i = 0
        while (curr != None and i < index):
            curr = curr.next
            i += 1
        return curr

    def __extend(self, iterable):
        for item in iterable:
            self.appendright(item)

    def __delitem__(self, index):
        to_del = self.nodeat(index)
        self.remove(to_del)

    def __getitem__(self, index):
        return self.nodeat(index).value

    def __len__(self):
        return self.__size

    def __setitem__(self, index, value):
        node = self.__getitem__(index)
        if isinstance(value, Sllistnode):
            value = value.value
        node.value = value

    def __cmp__(self, other):
        for sval, oval in zip(self, other):
            result = cmp(sval, oval)
            if result != 0:
                return result

        result = len(self) - len(other)
        if result < 0:
            return -1
        elif result > 0:
            return 1
        return 0

    def __eq__(self, other):
        for sval, oval in zip(self, other):
            if sval == oval:
                return True
        return len(self) == len(other)

    def __ne__(self, other):
        for sval, oval in zip(self, other):
            if sval != oval:
                return True
        return len(self) != len(other)

    def __lt__(self, other):
        for sval, oval in zip(self, other):
            if sval < oval:
                return True
        return len(self) < len(other)

    def __le__(self, other):
        for sval, oval in zip(self, other):
            if sval <= oval:
                return True
        return len(self) <= len(other)

    def __gt__(self, other):
        for sval, oval in zip(self, other):
            if sval > oval:
                return True
        return len(self) > len(other)

    def __ge__(self, other):
        for sval, oval in zip(self, other):
            if sval >= oval:
                return True
        return len(self) >= len(other)

    def __str__(self):
        if self.__first is not None:
            return "sllist([%s])" % ', '.join((str(x) for x in self))
        else:
            return 'sllist()'

    def __repr__(self):
        if self.__first is not None:
            return "sllist([%s])" % ', '.join((repr(x) for x in self))
        else:
            return 'sllist()'

    def __iter__(self):
        current = self.__first
        while current is not None:
            yield current.value
            current = current.next

    def iternodes(self, to=None):
        if self.__first is not None:
            return self.__first.iternext(to=to)
        else:
            return iter([])

    def __get_prev(self, node):
        if not isinstance(node, Sllistnode):
            raise TypeError("Object must be Node instance")
        if not self.__first:
            raise IndexError("List is empty")
        if self.__first == node:
            return None
        curr = self.__first
        prev = None
        while (curr and curr != node):
            prev = curr
            curr = curr.next
        return prev

    def appendleft(self, value):
        if isinstance(value, Sllistnode):
            value = value.value
        new_node = Sllistnode(value=value, next=self.__first, list=self)
        self.__first = new_node
        if self.__last is None:
            self.__last = new_node
        self.__size += 1
        return new_node

    def insert(self, value, before=None):
        if before is None:
            return self.appendright(value)
        else:
            return self.insertbefore(before, value)

    def insertafter(self, node, value):
        if not isinstance(node, Sllistnode):
            raise TypeError("node must be instance of sllistnode")
        if not self.__first:
            raise ValueError("List is empty")
        if node.list is not self:
            raise ValueError("Node is not element of this list")
        if isinstance(value, Sllistnode):
            value = value.value
        new_node = Sllistnode(value=value, next=None, list=self)
        new_node._sllistnode__next = node.next
        node._sllistnode__next = new_node
        if self.__last is node:
            self.__last = new_node
        self.__size += 1
        return new_node

    def insertbefore(self, node, value):
        if not isinstance(node, Sllistnode):
            raise TypeError("node must be instance of sllistnode")
        if not self.__first:
            raise ValueError("List is empty")
        if node.list is not self:
            raise ValueError("Node is not element of this list")
        if isinstance(value, Sllistnode):
            value = value.value
        new_node = Sllistnode(value=value, next=None, list=self)
        prev = self.__get_prev(node)
        if prev:
            prev._sllistnode__next = new_node
            new_node._sllistnode__next = node
        else:
            new_node._sllistnode__next = node
            self.__first = new_node
        self.__size += 1
        return new_node

    def append(self, value):
        return self.appendright(value)

    def appendright(self, value):
        if isinstance(value, Sllistnode):
            value = value.value
        new_node = Sllistnode(value=value, next=None, list=self)
        if not self.__first:
            self.__first = new_node
        else:
            self.__last._sllistnode__next = new_node
        self.__last = new_node
        self.__size += 1
        return new_node

    def popleft(self):
        if not self.__first:
            raise ValueError("List is empty")

        del_node = self.__first
        self.__first = del_node.next
        if self.__last == del_node:
            self.__last = None
        self.__size -= 1

        del_node._sllistnode__next = None
        del_node._sllistnode__list = None

        return del_node.value

    def pop(self):
        return self.popright()

    def popright(self):
        if not self.__first:
            raise ValueError("List is empty")

        del_node = self.__last
        if self.__first == del_node:
            self.__last = None
            self.__first = None
        else:
            prev = self.__get_prev(del_node)
            prev._sllistnode__next = None
            self.__last = prev
        self.__size -= 1

        del_node._sllistnode__list = None

        return del_node.value

    def remove(self, node):
        if not isinstance(node, Sllistnode):
            raise TypeError("node must be a sllistnode")
        if self.__first is None:
            raise ValueError("List is empty")
        if node.list is not self:
            raise ValueError("Node is not element of this list")

        prev = self.__get_prev(node)
        if not prev:
            self.popleft()
        else:
            prev._sllistnode__next = node.next
            if self.__last == node:
                self.__last = prev
            self.__size -= 1

        node._sllistnode__next = None
        node._sllistnode__list = None

        return node.value

    def __add__(self, sequence):
        new_list = sllist(self)

        for value in sequence:
            new_list.appendright(value)

        return new_list

    def __iadd__(self, sequence):
        if sequence is not self:
            for value in sequence:
                self.appendright(value)
        else:
            # slower path which avoids endless loop
            # when extending list with itself
            node = sequence.__first
            last_node = self.__last
            while node is not None:
                self.appendright(node.value)
                if node is last_node:
                    break
                node = node.next

        return self

    def __mul__(self, count):
        if not isinstance(count, int):
            raise TypeError('count must be an integer')

        new_list = sllist()
        for i in range(count):
            new_list += self

        return new_list

    def __imul__(self, count):
        if not isinstance(count, int):
            raise TypeError('count must be an integer')

        last_node = self.__last
        for i in range(count - 1):
            node = self.__first
            while node is not None:
                self.appendright(node.value)
                if node is last_node:
                    break
                node = node.next

        return self

    def __hash__(self):
        h = 0

        for value in self:
            h ^= hash(value)

        return h


class Dllistnode(Generic[GenType]):
    __slots__ = ('__prev', '__next', 'value', '__list', 'idx')

    def __init__(self, value=None, prev=None, next=None, list=None, idx=0):
        if isinstance(value, Dllistnode):
            value = value.value
        self.idx = idx
        self.__prev = prev
        self.__next = next
        self.value = value
        self.__list = list

        if prev is not None:
            prev.__next = self
        if next is not None:
            next.__prev = self

    @property
    def prev(self) -> Self:
        return self.__prev

    @property
    def next(self) -> Self | None:
        return self.__next

    @property
    def list(self) -> List[Self]:
        return self.__list

    def _iter(self, direction, to=None):
        if to is not None:
            if not isinstance(to, Dllistnode):
                raise TypeError('to argument must be a dllistnode')
            if to.list is not self.__list:
                raise ValueError('to argument belongs to another list')

        current = self
        while current is not None and current != to:
            yield current
            current = direction(current)

    def iternext(self, to=None):
        return self._iter(lambda x: x.__next, to=to)

    def iterprev(self, to=None):
        return self._iter(lambda x: x.__prev, to=to)

    def __call__(self) -> GenType:
        return self.value

    def __str__(self):
        return 'dllistnode(' + str(self.value) + ')'

    def __repr__(self):
        return '<dllistnode(' + repr(self.value) + ')>'


class Dllist(Generic[GenType]):
    __slots__ = ('__first', '__last', '__size',
                 '__last_access_node', '__last_access_idx')

    def __init__(self, sequence=None):
        self.__first = None
        self.__last = None
        self.__size = 0
        self.__last_access_node = None
        self.__last_access_idx = -1

        if sequence is None:
            return

        for idx, value in enumerate(sequence):
            node = Dllistnode(value, self.__last, None, self, idx=idx)

            if self.__first is None:
                self.__first = node
            self.__last = node
            self.__size += 1

    @property
    def first(self) -> Dllistnode[GenType]:
        return self.__first

    @property
    def last(self) -> Dllistnode[GenType]:
        return self.__last

    @property
    def size(self) -> int:
        return self.__size

    def nodeat(self, index):
        if not isinstance(index, int):
            raise TypeError('invalid index type')

        if index < 0:
            index = self.__size + index

        if index < 0 or index >= self.__size:
            raise IndexError('index out of range')

        middle = index / 2
        if index <= middle:
            node = self.__first
            start_idx = 0
            reverse_dir = False
        else:
            node = self.__last
            start_idx = self.__size - 1
            reverse_dir = True

        if self.__last_access_node is not None and \
                self.__last_access_idx >= 0 and \
                abs(index - self.__last_access_idx) < middle:
            node = self.__last_access_node
            start_idx = self.__last_access_idx
            if index < start_idx:
                reverse_dir = True
            else:
                reverse_dir = False

        if not reverse_dir:
            while start_idx < index:
                node = node.next
                start_idx += 1
        else:
            while start_idx > index:
                node = node.prev
                start_idx -= 1

        self.__last_access_node = node
        self.__last_access_idx = index

        return node

    def appendleft(self, x):
        node = Dllistnode(x, None, self.__first, self)

        if self.__last is None:
            self.__last = node
        self.__first = node
        self.__size += 1

        if self.__last_access_idx >= 0:
            self.__last_access_idx += 1
        return node

    def appendright(self, x):
        node = Dllistnode(x, self.__last, None, self)

        if self.__first is None:
            self.__first = node
        self.__last = node
        self.__size += 1

        return node

    def append(self, x):
        return self.appendright(x)

    def insert(self, x, before=None, after=None):
        if after is not None:
            if before is not None:
                raise ValueError('Only before or after argument can be defined')
            before = after.next

        if before is None:
            return self.appendright(x)

        if not isinstance(before, Dllistnode):
            raise TypeError('before/after argument must be a dllistnode')

        if before.list is not self:
            raise ValueError('before/after argument belongs to another list')

        node = Dllistnode(x, before.prev, before, self)

        if before is self.__first:
            self.__first = node
        self.__size += 1

        self.__last_access_node = None
        self.__last_access_idx = -1

        return node

    def popleft(self):
        if self.__first is None:
            raise ValueError('list is empty')

        node = self.__first
        self.__first = node.next
        if self.__last is node:
            self.__last = None
        self.__size -= 1

        if node.prev is not None:
            node.prev._dllistnode__next = node.next
        if node.next is not None:
            node.next._dllistnode__prev = node.prev

        node._dllistnode__next = None
        node._dllistnode__list = None

        if self.__last_access_node is not node:
            if self.__last_access_idx >= 0:
                self.__last_access_idx -= 1
        else:
            self.__last_access_node = None
            self.__last_access_idx = -1

        return node.value

    def popright(self):
        if self.__last is None:
            raise ValueError('list is empty')

        node = self.__last
        self.__last = node.prev
        if self.__first is node:
            self.__first = None
        self.__size -= 1

        if node.prev is not None:
            node.prev._dllistnode__next = node.next
        if node.next is not None:
            node.next._dllistnode__prev = node.prev

        node._dllistnode__prev = None
        node._dllistnode__list = None

        if self.__last_access_node is node:
            self.__last_access_node = None
            self.__last_access_idx = -1

        return node.value

    def pop(self):
        return self.popright()

    def remove(self, node):
        if not isinstance(node, Dllistnode):
            raise TypeError('node argument must be a dllistnode')

        if self.__first is None:
            raise ValueError('list is empty')

        if node.list is not self:
            raise ValueError('node argument belongs to another list')

        if self.__first is node:
            self.__first = node.next
        if self.__last is node:
            self.__last = node.prev
        self.__size -= 1

        if node.prev is not None:
            node.prev._dllistnode__next = node.next
        if node.next is not None:
            node.next._dllistnode__prev = node.prev

        node._dllistnode__prev = None
        node._dllistnode__next = None
        node._dllistnode__list = None

        self.__last_access_node = None
        self.__last_access_idx = -1

        return node.value

    def iternodes(self, to=None):
        if self.__first is not None:
            return self.__first.iternext(to=to)
        else:
            return iter([])

    def __len__(self):
        return self.__size

    def __cmp__(self, other):
        for sval, oval in zip(self, other):
            result = cmp(sval, oval)
            if result != 0:
                return result

        result = len(self) - len(other)
        if result < 0:
            return -1
        elif result > 0:
            return 1
        return 0

    def __eq__(self, other):
        for sval, oval in zip(self, other):
            if sval == oval:
                return True
        return len(self) == len(other)

    def __ne__(self, other):
        for sval, oval in zip(self, other):
            if sval != oval:
                return True
        return len(self) != len(other)

    def __lt__(self, other):
        for sval, oval in zip(self, other):
            if sval < oval:
                return True
        return len(self) < len(other)

    def __le__(self, other):
        for sval, oval in zip(self, other):
            if sval <= oval:
                return True
        return len(self) <= len(other)

    def __gt__(self, other):
        for sval, oval in zip(self, other):
            if sval > oval:
                return True
        return len(self) > len(other)

    def __ge__(self, other):
        for sval, oval in zip(self, other):
            if sval >= oval:
                return True
        return len(self) >= len(other)

    def __str__(self):
        if self.__first is not None:
            return 'dllist([' + ', '.join((str(x) for x in self)) + '])'
        else:
            return 'dllist()'

    def __repr__(self):
        if self.__first is not None:
            return 'dllist([' + ', '.join((repr(x) for x in self)) + '])'
        else:
            return 'dllist()'

    def __iter__(self):
        current = self.__first
        while current is not None:
            yield current.value
            current = current.next

    def __reversed__(self):
        current = self.__last
        while current is not None:
            yield current.value
            current = current.prev

    def __getitem__(self, index):
        return self.nodeat(index).value

    def __setitem__(self, index, value):
        self.nodeat(index).value = value

    def __delitem__(self, index):
        node = self.nodeat(index)
        self.remove(node)

        if node.prev is not None and index > 0:
            self.__last_access_node = node.prev
            self.__last_access_idx = index - 1

    def __add__(self, sequence):
        new_list = Dllist(self)

        for value in sequence:
            new_list.append(value)

        return new_list

    def __iadd__(self, sequence):
        if sequence is not self:
            for value in sequence:
                self.append(value)
        else:
            # slower path which avoids endless loop
            # when extending list with itself
            node = sequence.__first
            last_node = self.__last
            while node is not None:
                self.append(node.value)
                if node is last_node:
                    break
                node = node.next

        return self

    def __mul__(self, count):
        if not isinstance(count, int):
            raise TypeError('count must be an integer')

        new_list = Dllist()
        for i in range(count):
            new_list += self

        return new_list

    def __imul__(self, count):
        if not isinstance(count, int):
            raise TypeError('count must be an integer')

        last_node = self.__last
        for i in range(count - 1):
            node = self.__first
            while node is not None:
                self.appendright(node.value)
                if node is last_node:
                    break
                node = node.next

        return self

    def __hash__(self):
        h = 0

        for value in self:
            h ^= hash(value)

        return h
