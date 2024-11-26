from itertools import chain
from typing import Optional

from .consts import EventType, FragmentMergeMode


class ServerSentEventGenerator:
    def _send(
        self,
        event_type: EventType,
        data_lines: list[str],
        event_id: Optional[int] = None,
        retry_duration: int = 1_000,
    ) -> str:
        prefix = []
        if event_id:
            prefix.append(f"id: {event_id}")

        prefix.append(f"event: {event_type}")

        if retry_duration:
            prefix.append(f"retry: {retry_duration}")

        data_lines.append("\n")

        return "\n".join(chain(prefix, data_lines))

    def merge_fragments(
        self,
        fragments: list[str],
        selector: Optional[str] = None,
        merge_mode: FragmentMergeMode = None,
        settle_duration: Optional[int] = None,
        use_view_transition: bool = True,
        event_id: Optional[int] = None,
        retry_duration: int = 1_000,
    ):
        data_lines = []
        if merge_mode:
            data_lines.append(f"data: merge {merge_mode}")
        if selector:
            data_lines.append(f"data: selector {selector}")
        if use_view_transition:
            data_lines.append("data: useViewTransition true")
        else:
            data_lines.append("data: useViewTransition false")
        if settle_duration:
            data_lines.append(f"data: settleDuration {settle_duration}")

        data_lines.extend(
            f"data: fragments {x}"
            for fragment in fragments
            for x in fragment.splitlines()
        )

        return self._send(
            EventType.MERGE_FRAGMENTS, data_lines, event_id, retry_duration
        )

    def remove_fragments(
        self,
        selector: Optional[str] = None,
        settle_duration: Optional[int] = None,
        use_view_transition: bool = True,
        event_id: Optional[int] = None,
        retry_duration: int = 1_000,
    ):
        data_lines = []
        if selector:
            data_lines.append(f"data: selector {selector}")
        if use_view_transition:
            data_lines.append("data: useViewTransition true")
        else:
            data_lines.append("data: useViewTransition false")
        if settle_duration:
            data_lines.append(f"data: settleDuration {settle_duration}")

        return self._send(
            EventType.REMOVE_FRAGMENTS, data_lines, event_id, retry_duration
        )

    def merge_signals(
        self,
        data: list[str],
        event_id: Optional[int] = None,
        only_if_missing: bool = False,
        retry_duration: int = 1_000,
    ):
        data_lines = []
        if only_if_missing:
            data_lines.append("data: onlyIfMissing true")

        data_lines.append(f"data: signals {' '.join(data)}")

        return self._send(EventType.MERGE_SIGNALS, data_lines, event_id, retry_duration)

    def remove_signals(
        self,
        paths: list[str],
        event_id: Optional[int] = None,
        retry_duration: int = 1_000,
    ):
        data_lines = []

        data_lines.append(f"data: paths {' '.join(path for path in paths)}")

        return self._send(
            EventType.REMOVE_SIGNALS, data_lines, event_id, retry_duration
        )

    def execute_script(
        self,
        script: str,
        auto_remove: bool = True,
        attributes: Optional[list[str]] = None,
        event_id: Optional[int] = None,
        retry_duration: int = 1_000,
    ):
        data_lines = []
        data_lines.append(f"data: autoRemove {auto_remove}")

        if attributes:
            data_lines.extend(
                f"data: attributes {attribute}"
                for attribute in attributes
                if attribute.strip() != "type module"
            )

        data_lines.extend(
            f"data: script {script_line}" for script_line in script.splitlines()
        )

        return self._send(
            EventType.EXECUTE_SCRIPT, data_lines, event_id, retry_duration
        )
