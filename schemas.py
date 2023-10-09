from pydantic import BaseModel


class SignalParams(BaseModel):
    position: int
    machine: str
    job: str
    failure: str
    remote_mode: str
    manual_start: str
    running: str
    running_seconds: str
    number_of_starts: str

    def to_dict(self):
        return self.dict()

    def to_sequence_list(self) -> list:
        return [getattr(self, attr_name) for attr_name in self.__annotations__]
